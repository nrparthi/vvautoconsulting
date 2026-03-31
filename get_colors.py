from PIL import Image
from collections import Counter
import sys

try:
    img = Image.open('valga (2).jpeg')
    img = img.convert('RGB')
    
    # Scale down to speed up
    img.thumbnail((100, 100))
    
    pixels = list(img.getdata())
    counter = Counter(pixels)
    
    print("Most common colors:")
    for color, count in counter.most_common(10):
        print(f"RGB: {color}, Count: {count}")
except Exception as e:
    print(f"Error: {e}")
