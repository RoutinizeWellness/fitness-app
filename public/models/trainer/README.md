# 3D Avatar Trainer Model

This directory is intended to contain the 3D model file for the trainer avatar.

## Expected File
- `trainer.glb` - The main 3D model file in GLB format

## Fallback Mechanism
If the 3D model file is not available, the application will automatically use a fallback avatar implemented with basic Three.js geometries.

## Model Requirements
The 3D model should:
1. Be in GLB format
2. Include animations for:
   - idle
   - greeting
   - demonstrating
   - celebrating
   - guiding
3. Have a humanoid structure
4. Be properly rigged for animations
5. Be optimized for web use (low poly count)

## Adding a Custom Model
To add a custom model:
1. Export your 3D model in GLB format
2. Name it `trainer.glb`
3. Place it in this directory
4. Ensure it has the required animations
5. Restart the application

## Troubleshooting
If the model doesn't appear:
- Check the browser console for errors
- Verify the model file is in the correct location
- Ensure the model has the required animations
- Check that the model is properly exported in GLB format
