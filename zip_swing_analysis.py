import zipfile
import os

# Path to the folder to zip
FOLDER_TO_ZIP = 'swing-analysis'
ZIP_FILENAME = 'swing-analysis.zip'

# Create a zip file in write mode
with zipfile.ZipFile(ZIP_FILENAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(FOLDER_TO_ZIP):
        # Exclude node_modules directory
        dirs[:] = [d for d in dirs if d != 'node_modules']
        for file in files:
            # Skip MP4 files (reference videos)
            if file.endswith('.MP4') or file.endswith('.mp4'):
                continue
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, FOLDER_TO_ZIP)
            zipf.write(file_path, arcname)

print(f'Zipped {FOLDER_TO_ZIP} to {ZIP_FILENAME}')
