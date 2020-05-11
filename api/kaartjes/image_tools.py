from PIL import Image
import base64


def crop_image(path, width, height, x, y, output):
    image = Image.open(path)
    image.crop((x, y, x + width, y + height)).save(output, 'png')


def vlinder_png_to_base64(path):
    with open(path, 'rb') as f:
        return base64.b64encode(f.read())


if __name__ == '__main__':
    import os
    for image in os.listdir('.'):
        if image.endswith('.png'):
            crop_image(image, 590, 255, 5, 40, f'vlinder{image[7:9]}_crop.png')
