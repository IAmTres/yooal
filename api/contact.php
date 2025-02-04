<?php
// Security headers
header("Content-Security-Policy: default-src 'self'");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");

// Configuration
$config = [
    'recipient_email' => base64_decode('YnJhZHJvc2U5NDFAZ21haWwuY29t'), // Encoded email
    'recaptcha_secret' => '6LcpwswqAAAAAJj7pg74NfkF_iKMYzFi0gNoIUBC',
    'max_email_length' => 100,
    'max_name_length' => 50,
    'max_subject_length' => 100,
    'max_message_length' => 1000,
];

// CORS headers for security
header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 3600");

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method Not Allowed');
}

// Validate CSRF token
session_start();
if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    http_response_code(403);
    exit('Invalid CSRF token');
}

// Honeypot check
if (!empty($_POST['website'])) {
    http_response_code(200); // Pretend success
    exit();
}

// Validate reCAPTCHA
$recaptcha_response = $_POST['g-recaptcha-response'];
$verify_url = "https://www.google.com/recaptcha/api/siteverify";
$data = [
    'secret' => $config['recaptcha_secret'],
    'response' => $recaptcha_response,
    'remoteip' => $_SERVER['REMOTE_ADDR']
];

$options = [
    'http' => [
        'header' => "Content-type: application/x-www-form-urlencoded\r\n",
        'method' => 'POST',
        'content' => http_build_query($data)
    ]
];

$context = stream_context_create($options);
$verify_response = file_get_contents($verify_url, false, $context);
$captcha_success = json_decode($verify_response);

if (!$captcha_success->success) {
    http_response_code(400);
    exit('Invalid reCAPTCHA');
}

// Sanitize and validate input
$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
$subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_STRING);
$message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);

if (!$name || !$email || !$subject || !$message) {
    http_response_code(400);
    exit('Missing required fields');
}

if (strlen($name) > $config['max_name_length'] ||
    strlen($email) > $config['max_email_length'] ||
    strlen($subject) > $config['max_subject_length'] ||
    strlen($message) > $config['max_message_length']) {
    http_response_code(400);
    exit('Input too long');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    exit('Invalid email format');
}

// Prepare email
$headers = [
    'From' => $email,
    'Reply-To' => $email,
    'X-Mailer' => 'PHP/' . phpversion(),
    'Content-Type' => 'text/plain; charset=utf-8'
];

$email_body = "Name: " . $name . "\n";
$email_body .= "Email: " . $email . "\n";
$email_body .= "Subject: " . $subject . "\n\n";
$email_body .= "Message:\n" . $message;

// Rate limiting (optional)
$rate_limit_file = sys_get_temp_dir() . '/email_' . md5($_SERVER['REMOTE_ADDR']) . '.txt';
if (file_exists($rate_limit_file) && (time() - filemtime($rate_limit_file)) < 300) {
    http_response_code(429);
    exit('Too many requests');
}

// Send email
$mail_sent = mail($config['recipient_email'], 
    "Website Contact: " . $subject,
    $email_body,
    $headers
);

if ($mail_sent) {
    touch($rate_limit_file); // Update rate limit
    http_response_code(200);
    echo json_encode(['message' => 'Message sent successfully']);
} else {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to send message']);
}
