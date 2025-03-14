from PIL import Image
import os

def resize_and_optimize_images(directory):
    # Проверяем, существует ли директория
    if not os.path.isdir(directory):
        print("Указанная директория не найдена!")
        return

    # Создаём папку для оптимизированных изображений
    optimized_dir = os.path.join(directory, "optimized")
    os.makedirs(optimized_dir, exist_ok=True)

    # Перебираем файлы в директории
    for filename in os.listdir(directory):
        if filename.lower().endswith(('jpg', 'jpeg', 'png')):
            file_path = os.path.join(directory, filename)

            try:
                with Image.open(file_path) as img:
                    # Вычисляем новую ширину, сохраняя пропорции
                    w_percent = (300 / float(img.height))
                    new_width = int((float(img.width) * float(w_percent)))
                    img = img.resize((new_width, 300), Image.LANCZOS)

                    # Оптимизируем и сохраняем в новую папку
                    output_path = os.path.join(optimized_dir, filename)
                    img.save(output_path, optimize=True, quality=85)
                    print(f"Оптимизировано: {output_path}")
            except Exception as e:
                print(f"Ошибка обработки {filename}: {e}")

# Укажите путь к папке с изображениями
resize_and_optimize_images("./image")
