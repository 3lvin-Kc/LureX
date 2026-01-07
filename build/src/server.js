const express = require('express');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp').mkdirp;
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json({ limit: '50mb' }));

// Single POST endpoint to handle build requests
app.post('/build', async (req, res) => {
  try {
    const { projectId, files } = req.body;

    // Validate request structure
    if (!projectId || !files || typeof files !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request format. Expected projectId and files object.'
      });
    }

    // Create workspace directories
    const workspacePath = path.join(__dirname, '..', 'builds', projectId);
    const sourcePath = path.join(workspacePath, 'source');
    const outputPath = path.join(workspacePath, 'output');
    
    await mkdirp(sourcePath);
    await mkdirp(outputPath);

    // Write files to the source directory
    for (const [relativePath, content] of Object.entries(files)) {
      // Prevent path traversal
      if (relativePath.includes('..')) {
        throw new Error('Invalid file path');
      }
      
      const filePath = path.join(sourcePath, relativePath);
      
      // Ensure the directory exists before writing the file
      const dirPath = path.dirname(filePath);
      await mkdirp(dirPath);
      
      // Write the file content
      await fs.promises.writeFile(filePath, content, 'utf8');
    }

    // Run Flutter build in Docker container
    const buildResult = await runFlutterDockerBuild(sourcePath, outputPath);
    
    if (!buildResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Flutter build failed',
        error: buildResult.error
      });
    }

    // Return success response
    res.json({
      success: true,
      projectId,
      workspacePath,
      buildOutput: buildResult.output
    });
  } catch (error) {
    console.error('Build service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process build request'
    });
  }
});

// Run Flutter build in Docker container
async function runFlutterDockerBuild(sourcePath, outputPath) {
  return new Promise((resolve) => {
    console.log(`Starting Flutter build for ${sourcePath}`);
    
    // Convert Windows paths to Docker-compatible format
    const dockerSourcePath = sourcePath.replace(/\\/g, '/');
    
    console.log(`Docker source path: ${dockerSourcePath}`);
    
    const dockerArgs = [
  'run',
  '--rm',
  '-v', `${dockerSourcePath}:/app`,
  'cirrusci/flutter:stable',
  'sh',
  '-c',
  'cd /app && flutter create . --platforms web && flutter build web --release'
];
 
    
    console.log(`Docker command: docker ${dockerArgs.join(' ')}`);
    
    const docker = spawn('docker', dockerArgs);

    let stdout = '';
    let stderr = '';

    docker.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    docker.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    docker.on('close', (code) => {
      console.log(`Flutter build completed with exit code: ${code}`);
      
      if (code === 0) {
        resolve({
          success: true,
          output: stdout
        });
      } else {
        resolve({
          success: false,
          error: stderr || `Build failed with exit code ${code}`
        });
      }
    });

    docker.on('error', (error) => {
      console.error('Docker error:', error);
      resolve({
        success: false,
        error: error.message
      });
    });
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Build service listening on port ${PORT}`);
});

module.exports = app;