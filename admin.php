<?php

// Файл с данными
$jsonFile = 'places.json';

// Загружаем текущие данные
$places = file_exists($jsonFile) ? json_decode(file_get_contents($jsonFile), true) : [];

// Функция для сохранения данных в JSON
function savePlaces($places) {
    global $jsonFile;
    file_put_contents($jsonFile, json_encode($places, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Добавление или редактирование места
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $index = isset($_POST['index']) ? (int)$_POST['index'] : -1;
    $newPlace = [
        "name" => $_POST['name'],
        "lat" => (float)$_POST['lat'],
        "lng" => (float)$_POST['lng'],
        "description" => $_POST['description'],
        "link" => $_POST['link'],
        "instagram" => $_POST['instagram'],
        "maps_url" => $_POST['maps_url'],
        "image" => $_POST['image'],
        "attributes" => array_map('trim', explode(',', $_POST['attributes']))
    ];

    if ($index >= 0 && isset($places[$index])) {
        $places[$index] = $newPlace; // Редактирование
    } else {
        $places[] = $newPlace; // Добавление
    }

    savePlaces($places);
    header("Location: admin.php");
    exit();
}

// Удаление места
if (isset($_GET['delete'])) {
    $index = (int)$_GET['delete'];
    if (isset($places[$index])) {
        array_splice($places, $index, 1);
        savePlaces($places);
    }
    header("Location: admin.php");
    exit();
}

?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Админка - Места</title>
    <style>
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        form { margin-bottom: 20px; }
    </style>
</head>
<body>
    <h2>Список мест</h2>
    <table>
        <tr>
            <th>Название</th>
            <th>Координаты</th>
            <th>Описание</th>
            <th>Ссылки</th>
            <th>Атрибуты</th>
            <th>Действия</th>
        </tr>
        <?php foreach ($places as $index => $place): ?>
            <tr>
                <td><?= htmlspecialchars($place['name']) ?></td>
                <td><?= $place['lat'] ?>, <?= $place['lng'] ?></td>
                <td><?= htmlspecialchars($place['description']) ?></td>
                <td>
                    <a href="<?= $place['link'] ?>" target="_blank">Сайт</a> |
                    <a href="<?= $place['instagram'] ?>" target="_blank">Instagram</a> |
                    <a href="<?= $place['maps_url'] ?>" target="_blank">Google Maps</a>
                </td>
                <td><?= implode(', ', $place['attributes']) ?></td>
                <td>
                    <a href="admin.php?edit=<?= $index ?>">Редактировать</a> |
                    <a href="admin.php?delete=<?= $index ?>" onclick="return confirm('Удалить место?');">Удалить</a>
                </td>
            </tr>
        <?php endforeach; ?>
    </table>

    <h2><?= isset($_GET['edit']) ? 'Редактировать место' : 'Добавить место' ?></h2>
    <?php
    $editPlace = isset($_GET['edit']) ? $places[(int)$_GET['edit']] : [
        "name" => "", "lat" => "", "lng" => "", "description" => "",
        "link" => "", "instagram" => "", "maps_url" => "", "image" => "", "attributes" => ""
    ];
    ?>
    <form method="post">
        <input type="hidden" name="index" value="<?= isset($_GET['edit']) ? (int)$_GET['edit'] : -1 ?>">
        <label>Название: <input type="text" name="name" value="<?= htmlspecialchars($editPlace['name']) ?>" required></label><br>
        <label>Широта: <input type="text" name="lat" value="<?= $editPlace['lat'] ?>" required></label><br>
        <label>Долгота: <input type="text" name="lng" value="<?= $editPlace['lng'] ?>" required></label><br>
        <label>Описание: <textarea name="description"><?= htmlspecialchars($editPlace['description']) ?></textarea></label><br>
        <label>Ссылка: <input type="text" name="link" value="<?= $editPlace['link'] ?>"></label><br>
        <label>Instagram: <input type="text" name="instagram" value="<?= $editPlace['instagram'] ?>"></label><br>
        <label>Google Maps: <input type="text" name="maps_url" value="<?= $editPlace['maps_url'] ?>"></label><br>
        <label>Изображение: <input type="text" name="image" value="<?= $editPlace['image'] ?>"></label><br>
        <label>Атрибуты (через запятую): <input type="text" name="attributes" value="<?= implode(',', (array)$editPlace['attributes']) ?>"></label><br>
        <button type="submit">Сохранить</button>
    </form>
</body>
</html>
