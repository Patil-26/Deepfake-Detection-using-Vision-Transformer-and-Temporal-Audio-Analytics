import os

def create_project_snapshot(output_filename="codebase_snapshot.txt"):
    # Folders we don't want the AI to read
    exclude_dirs = {'.git', 'venv', '__pycache__', 'node_modules', 'frontend_build'}
    # File types that are binary or irrelevant
    exclude_exts = {'.pyc', '.png', '.jpg', '.jpeg', '.mp4', '.pt', '.pth', '.onnx', '.sqlite3'}
    
    with open(output_filename, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk('.'):
            # Modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                # Skip excluded extensions and the script itself
                if any(file.endswith(ext) for ext in exclude_exts) or file == "snapshot.py":
                    continue
                
                file_path = os.path.join(root, file)
                
                outfile.write(f"\n{'='*60}\n")
                outfile.write(f"FILE: {file_path}\n")
                outfile.write(f"{'='*60}\n")
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        outfile.write(infile.read())
                except Exception as e:
                    outfile.write(f"[Error reading file: {e}]\n")
                    
    print(f"Snapshot created successfully: {output_filename}")

if __name__ == "__main__":
    create_project_snapshot()