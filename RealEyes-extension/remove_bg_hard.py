from PIL import Image

def remove_background(input_path, output_path):
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # item is (R, G, B, A)
            r, g, b, a = item
            
            # If the pixel is very dark (close to black background), make it fully transparent
            if r < 20 and g < 20 and b < 20:
                newData.append((0, 0, 0, 0))
            else:
                # Keep the pixel exactly as it was, fully opaque for solid visibility
                newData.append((r, g, b, 255))

        img.putdata(newData)
        img.save(output_path, "PNG")
        print("Success: Purely removed black bg.")
    except Exception as e:
        print(f"Error: {e}")

remove_background(r"C:\Users\LENOVO\.gemini\antigravity\brain\e076e9ea-9005-46e9-a8b3-d083d67528e4\media__1776540200375.png", r"c:\Users\LENOVO\Desktop\DeepGuard-extension\web\public\logo.png")
