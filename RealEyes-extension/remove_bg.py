from PIL import Image
import sys

def remove_background(input_path, output_path):
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            r, g, b, a = item
            # Find the max color channel (brightness)
            brightness = max(r, g, b)
            
            # Using additive blending logic to extract glow from black background
            if brightness > 0:
                # We scale the color up so it regains its brightness when drawn with the new alpha
                new_r = int((r / brightness) * 255)
                new_g = int((g / brightness) * 255)
                new_b = int((b / brightness) * 255)
                
                # We use the original brightness as the new opacity (alpha)
                # To prevent it from being too faint, we can boost the alpha slightly
                # Alpha boost mapping:
                new_a = min(int(brightness * 1.5), 255)
                
                newData.append((min(new_r, 255), min(new_g, 255), min(new_b, 255), new_a))
            else:
                newData.append((0, 0, 0, 0))

        img.putdata(newData)
        img.save(output_path, "PNG")
        print("Success")
    except Exception as e:
        print(f"Error: {e}")

remove_background(r"C:\Users\LENOVO\.gemini\antigravity\brain\e076e9ea-9005-46e9-a8b3-d083d67528e4\media__1776540200375.png", r"c:\Users\LENOVO\Desktop\DeepGuard-extension\web\public\logo.png")
