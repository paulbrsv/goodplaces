<?php
session_start();
$dataFile = 'places.json';
$places = json_decode(file_get_contents($dataFile), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'add') {
            $places[] = [
                'name' => $_POST['name'],
                'lat' => (float)$_POST['lat'],
                'lng' => (float)$_POST['lng'],
                'description' => $_POST['description'],
                'link' => $_POST['link'],
                'instagram' => $_POST['instagram'],
                'maps_url' => $_POST['maps_url'],
                'image' => $_POST['image'],
                'attributes' => explode(',', $_POST['attributes']),
                'verified' => isset($_POST['verified']) ? true : false
            ];
        } elseif ($_POST['action'] === 'edit') {
            $index = (int)$_POST['index'];
            $places[$index] = [
                'name' => $_POST['name'],
                'lat' => (float)$_POST['lat'],
                'lng' => (float)$_POST['lng'],
                'description' => $_POST['description'],
                'link' => $_POST['link'],
                'instagram' => $_POST['instagram'],
                'maps_url' => $_POST['maps_url'],
                'image' => $_POST['image'],
                'attributes' => explode(',', $_POST['attributes']),
                'verified' => isset($_POST['verified']) ? true : false
            ];
        } elseif ($_POST['action'] === 'delete') {
            $index = (int)$_POST['index'];
            array_splice($places, $index, 1);
        }
        file_put_contents($dataFile, json_encode($places, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Админка</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
    <style>
    .table-container { overflow-x: auto; }
    .modal-body input, .modal-body textarea { width: 100%; margin-bottom: 10px; }
    .badge {
        cursor: pointer;
        margin-right: 5px;
        margin-bottom: 5px;
        padding: 5px 10px;
        font-size: 0.875rem;
    }
    .badge-light {
        background-color: #f1f1f1;
        border: 1px solid #ccc;
        color: #333;
    }
    .badge-light:hover {
        background-color: #e0e0e0;
    }
    .badge-primary {
        background-color: #007bff;
        border-color: #007bff;
        color: white;
    }
    .badge-primary:hover {
        background-color: #0056b3;
        border-color: #004085;
    }
    .badge-warning {
        background-color: #ffc107;
        border-color: #ffc107;
        color: black;
    }
    .badge-warning:hover {
        background-color: #e0a800;
        border-color: #d39e00;
    }
    .badge-danger {
        background-color: #dc3545;
        border-color: #dc3545;
        color: white;
    }
    .badge-danger:hover {
        background-color: #c82333;
        border-color: #bd2130;
    }
    .badge-success {
        background-color: #28a745;
        border-color: #28a745;
        color: white;
    }
    .badge-success:hover {
        background-color: #218838;
        border-color: #1e7e34;
    }
    .clickable {
        cursor: pointer;
    }
    .clickable:hover {
        text-decoration: underline;
    }

    .table-container { overflow-x: auto; }
    .modal-body input, .modal-body textarea { width: 100%; margin-bottom: 10px; }

    /* Стили для поля атрибутов */
    #attributes {
      width: 100%;
      height: 80px; /* Увеличьте высоту, чтобы было больше пространства */
      white-space: normal;
      word-wrap: break-word;
      overflow-y: auto; /* Добавить вертикальную прокрутку */
  }

</style>

</head>
<body class="container mt-4">
    <h2>Список мест</h2>
    <button class="btn btn-success" onclick="openModal()">Добавить место</button>
    <p>
    <div class="table-container">
        <table class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th>Название</th>
                    <th>Широта</th>
                    <th>Долгота</th>
                    <th>Описание</th>
                    <th>Ссылка</th>
                    <th>Instagram</th>
                    <th>Карта</th>
                    <th>Изображение</th>
                    <th>Атрибуты</th>
                    <th>Проверено</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($places as $index => $place): ?>
                    <tr>
                        <td><?= htmlspecialchars($place['name']) ?></td>
                        <td><?= $place['lat'] ?></td>
                        <td><?= $place['lng'] ?></td>
                        <td><?= htmlspecialchars($place['description']) ?></td>
                        <td><a href="<?= $place['link'] ?>" target="_blank">Ссылка</a></td>
                        <td><a href="<?= $place['instagram'] ?>" target="_blank">Instagram</a></td>
                        <td><a href="<?= $place['maps_url'] ?>" target="_blank">Карта</a></td>
                        <td><img src="<?= $place['image'] ?>" width="50" height="50"></td>
                        <td><?= implode(', ', $place['attributes']) ?></td>
                        <td><?= $place['verified'] ? 'Да' : 'Нет' ?></td>
                        <td>
                            <button class="btn btn-warning btn-sm" onclick="editPlace(<?= $index ?>)">✏️</button>
                            <form method="post" class="d-inline">
                                <input type="hidden" name="index" value="<?= $index ?>">
                                <input type="hidden" name="action" value="delete">
                                <button type="submit" class="btn btn-danger btn-sm">🗑️</button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <div id="placeModal" class="modal fade">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Добавить/Редактировать место</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form method="post">
                        <input type="hidden" name="index" id="index">
                        <input type="hidden" name="action" id="action" value="add">
                        <input type="text" name="name" id="name" placeholder="Название" class="form-control">
                        <input type="text" name="lat" id="lat" placeholder="Широта" class="form-control">
                        <input type="text" name="lng" id="lng" placeholder="Долгота" class="form-control">
                        <textarea name="description" id="description" placeholder="Описание" class="form-control"></textarea>
                        <input type="text" name="link" id="link" placeholder="Ссылка" class="form-control">
                        <input type="text" name="instagram" id="instagram" placeholder="Instagram" class="form-control">
                        <input type="text" name="maps_url" id="maps_url" placeholder="Карта" class="form-control">
                        <input type="text" name="image" id="image" placeholder="Изображение" class="form-control">
                        <textarea name="attributes" id="attributes" placeholder="Атрибуты (через запятую)" class="form-control"></textarea>

                        <div id="attributes-suggestions" class="mt-2">
                            <span class="badge badge-light clickable" onclick="addAttribute('pet_friendly')">pet_friendly</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('no_smoking')">no_smoking</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('cafe')">cafe</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('bar')">bar</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('beer')">beer</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('wine')">wine</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('ice_cream')">ice cream</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('coffee_shop')">coffee_shop</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('specialty')">specialty</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('beans_sale')">beans_sale</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('desserts')">desserts</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('food')">food</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('snacks')">snacks</span>
                        </div>
                        <div class="form-check">
<label class="form-check-label" for="verified" style="margin-left: 8px; font-size: 16px;">Проверено</label>
    <input type="checkbox" name="verified" id="verified" class="form-check-input" style="width: 20px; height: 20px; margin-top: 3px;">

</div>

                        <button type="submit" class="btn btn-primary mt-2">Сохранить</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    <script>
        function openModal() {
            document.getElementById('action').value = 'add';
            new bootstrap.Modal(document.getElementById('placeModal')).show();
        }

        function editPlace(index) {
            document.getElementById('action').value = 'edit';
            document.getElementById('index').value = index;
            var place = <?= json_encode($places) ?>[index];

            document.getElementById('name').value = place.name;
            document.getElementById('lat').value = place.lat;
            document.getElementById('lng').value = place.lng;
            document.getElementById('description').value = place.description;
            document.getElementById('link').value = place.link;
            document.getElementById('instagram').value = place.instagram;
            document.getElementById('maps_url').value = place.maps_url;
            document.getElementById('image').value = place.image;
            document.getElementById('attributes').value = place.attributes.join(',');
            document.getElementById('verified').checked = place.verified;

            new bootstrap.Modal(document.getElementById('placeModal')).show();
        }

        function addAttribute(attribute) {
            var attributes = document.getElementById('attributes').value.split(',').map(s => s.trim());
            if (!attributes.includes(attribute)) {
                attributes.push(attribute);
            }
            document.getElementById('attributes').value = attributes.join(',');
        }
    </script>
</body>
</html>
