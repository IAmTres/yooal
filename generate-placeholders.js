const fs = require('fs').promises;
const path = require('path');

const projects = [
    {
        name: 'Legal Loans UK',
        filename: 'legal-loans.jpg',
        color: '#00ff95'
    },
    {
        name: 'Let\'s Help Guide',
        filename: 'lets-help-guide.jpg',
        color: '#00ffcc'
    },
    {
        name: 'Pipform',
        filename: 'pipform.jpg',
        color: '#ff3366'
    }
];

async function generatePlaceholder() {
    const projectsDir = path.join(__dirname, 'images', 'projects');
    try {
        await fs.mkdir(projectsDir, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }

    for (const project of projects) {
        const svgContent = `
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#111111"/>
    <text x="50%" y="50%" font-family="Arial" font-size="48" fill="${project.color}" text-anchor="middle" dominant-baseline="middle">
        ${project.name}
    </text>
    <text x="50%" y="58%" font-family="Arial" font-size="24" fill="#666666" text-anchor="middle" dominant-baseline="middle">
        Screenshot Coming Soon
    </text>
</svg>`;

        const filePath = path.join(projectsDir, project.filename.replace('.jpg', '.svg'));
        await fs.writeFile(filePath, svgContent);
        console.log(`Generated placeholder for ${project.name}`);
    }
}

generatePlaceholder().catch(console.error);
