<?php
session_start();
$dataFile = 'places.json';
$places = json_decode(file_get_contents($dataFile), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $response = ['status' => 'error'];
    if ($_POST['action'] === 'add' || $_POST['action'] === 'edit') {
        $place = [
            'name' => $_POST['name'],
            'lat' => (float)$_POST['lat'],
            'lng' => (float)$_POST['lng'],
            'shirt_description' => $_POST['shirt_description'],
            'description' => $_POST['description'],
            'link' => $_POST['link'],
            'instagram' => $_POST['instagram'],
            'maps_url' => $_POST['maps_url'],
            'image' => $_POST['image'],
            'attributes' => explode(',', $_POST['attributes']),
            'verified' => isset($_POST['verified']) ? true : false
        ];

        if ($_POST['action'] === 'add') {
            $places[] = $place;
        } elseif ($_POST['action'] === 'edit') {
            $index = (int)$_POST['index'];
            $places[$index] = $place;
        }

        file_put_contents($dataFile, json_encode($places, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $response['status'] = 'success';
        echo json_encode($response);
        exit;
    } elseif ($_POST['action'] === 'delete') {
        $index = (int)$_POST['index'];
        array_splice($places, $index, 1);
        file_put_contents($dataFile, json_encode($places, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $response['status'] = 'success';
        echo json_encode($response);
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
        .place-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .place-item {
            display: flex;
            background-color: #fff;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #ddd;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            justify-content: space-between;
            gap: 20px;
            position: relative;
            flex-wrap: wrap;
        }

        .place-item:nth-child(odd) {
            background-color: #f8f9fa;
        }

        .place-item:nth-child(even) {
            background-color: #ffffff;
        }

        .place-item .place-image {
            max-width: 150px;
            max-height: 150px;
            border-radius: 8px;
            object-fit: cover;
        }

        .place-item .place-info {
            flex: 1;
        }

        .place-item .place-info h5 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #007bff;
            margin-bottom: 10px;
        }

        .place-item .place-info p {
            font-size: 1rem;
            margin-bottom: 5px;
        }

        .place-item .place-details {
            font-size: 0.9rem;
            background-color: #f1f1f1;
            padding: 10px;
            border-radius: 8px;
            margin-top: 10px;
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
        }

        .badge {
            cursor: pointer;
            margin-right: 5px;
            margin-bottom: 5px;
            padding: 5px 10px;
            font-size: 0.875rem;
        }

        .badge-light { background-color: #f1f1f1; color: #333; }
        .badge-primary { background-color: #007bff; color: white; }
        .badge-warning { background-color: #ffc107; color: black; }
        .badge-danger { background-color: #dc3545; color: white; }
        .badge-success { background-color: #28a745; color: white; }

        .actions-cell {
            display: flex;
            gap: 10px;
            position: absolute;
            top: 15px;
            right: 15px;
        }

        .modal-content {
            padding: 20px;
        }

        .modal-body input,
        .modal-body textarea {
            margin-bottom: 10px;
        }

        .place-item .place-details-bottom {
            font-size: 0.9rem;
            background-color: #F1F1F1;
            padding: 5px;
            border-radius: 8px;
            margin-top: 0px;
            display: flex;
            gap: 5px;
            justify-content: flex-start;
            width: 100%;
        }

        .place-details-bottom a {
            display: inline-block;
            min-height: 0px;
            line-height: 0px;
        }

        .sticky-top {
            position: sticky;
            top: 20px;
            z-index: 10;
            background-color: #fff;
            padding: 0px 0;
        }

        #verifiedFilter {
            max-width: 200px;
        }
    </style>
</head>
<body class="container mt-4">
    <h2>Список мест</h2>
    <button class="btn btn-success mb-3" onclick="openModal()">Добавить место</button>

    <div class="sticky-top">
        <input type="text" id="searchInput" class="form-control mb-3"
               placeholder="Поиск..." onkeyup="filterPlaces()">

    </div>

    <div class="mb-3">
        <select id="verifiedFilter" class="form-select" onchange="filterPlaces()">
            <option value="all">Все места</option>
            <option value="verified">Только проверенные</option>
            <option value="unverified">Только непроверенные</option>
        </select>
    </div>

    <div class="place-container" id="placesContainer">
        <?php foreach ($places as $index => $place): ?>
            <div class="place-item" data-verified="<?= $place['verified'] ? 'true' : 'false' ?>">
                <div class="place-image-container">
                    <img src="<?= $place['image'] ?>" alt="<?= htmlspecialchars($place['name']) ?>" class="place-image">
                </div>
                <div class="place-info">
                    <h5><?= htmlspecialchars($place['name']) ?></h5>
                    <p><strong>Краткое описание:</strong> <br><?= htmlspecialchars($place['shirt_description']) ?></p>
                    <p><strong>Описание:</strong> <br><?= htmlspecialchars($place['description']) ?></p>
                    <p><strong>Атрибуты:</strong>
                        <br><?php foreach ($place['attributes'] as $attribute): ?>
                            <span class="badge badge-light"><?= htmlspecialchars($attribute) ?></span>
                        <?php endforeach; ?>
                    </p>
                    <p><strong>Проверено:</strong> <?= $place['verified'] ? 'Да' : 'Нет' ?></p>
                </div>
                <div class="actions-cell">
                    <button class="btn btn-warning btn-sm" onclick="editPlace(<?= $index ?>)">✏️</button>
                    <form method="post" class="d-inline" onsubmit="deletePlace(<?= $index ?>); return false;">
                        <input type="hidden" name="index" value="<?= $index ?>">
                        <input type="hidden" name="action" value="delete">
                        <button type="submit" class="btn btn-danger btn-sm">🗑️</button>
                    </form>
                </div>
                <div class="place-details-bottom">
                    <div><strong>Широта:</strong> <?= $place['lat'] ?></div>
                    <div><strong>Долгота:</strong> <?= $place['lng'] ?></div>
                    <div><a href="<?= $place['link'] ?>" target="_blank">Ссылка</a></div>
                    <div><a href="<?= $place['instagram'] ?>" target="_blank">Инстаграм</a></div>
                    <div><a href="<?= $place['maps_url'] ?>" target="_blank">Карта</a></div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>

    <div id="placeModal" class="modal fade">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Добавить/Редактировать место</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="placeForm" method="post">
                        <input type="hidden" name="index" id="index">
                        <input type="hidden" name="action" id="action" value="add">
                        <input type="text" name="name" id="name" placeholder="Название" class="form-control">
                        <input type="text" name="lat" id="lat" placeholder="Широта" class="form-control">
                        <input type="text" name="lng" id="lng" placeholder="Долгота" class="form-control">
                        <textarea name="shirt_description" id="shirt_description" placeholder="Краткое описание" class="form-control"></textarea>
                        <textarea name="description" id="description" placeholder="Описание" class="form-control"></textarea>
                        <input type="text" name="link" id="link" placeholder="Ссылка" class="form-control">
                        <input type="text" name="instagram" id="instagram" placeholder="Instagram" class="form-control">
                        <input type="text" name="maps_url" id="maps_url" placeholder="Карта" class="form-control">
                        <input type="text" name="image" id="image" placeholder="Изображение" class="form-control">
                        <textarea name="attributes" id="attributes" placeholder="Атрибуты (через запятую)" class="form-control"></textarea>

                        <div id="attributes-suggestions" class="mt-2">
                            <span class="badge badge-light clickable" onclick="addAttribute('no_smoking')">no_smoking</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('smoke')">smoke</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('pets_allowed')">pets_allowed</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('bar')">bar</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('beer')">beer</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('wine')">wine</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('ice_cream')">ice cream</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('coffee_shop')">coffee_shop</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('specialty')">specialty</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('beans_sale')">beans_sale</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('desserts')">desserts</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('food')">food</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('breakfast')">breakfast</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('snacks')">snacks</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('terrace')">terrace</span>
                            <span class="badge badge-light clickable" onclick="addAttribute('vegan')">vegan</span>
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
        // Кэшируем часто используемые элементы
        const placesContainer = document.getElementById('placesContainer');
        const placeModal = new bootstrap.Modal(document.getElementById('placeModal'));
        const placeForm = document.getElementById('placeForm');
        const searchInput = document.getElementById('searchInput');
        const verifiedFilter = document.getElementById('verifiedFilter');

        function filterPlaces() {
            const searchValue = searchInput.value.toLowerCase().trim();
            const verifiedValue = verifiedFilter.value;
            const places = placesContainer.querySelectorAll('.place-item');

            places.forEach(place => {
                // Поиск по тексту
                const textElements = place.querySelectorAll('h5, p, .badge');
                const latLng = place.querySelector('.place-details-bottom');
                let textMatch = false;

                textElements.forEach(el => {
                    if (el.textContent.toLowerCase().includes(searchValue)) {
                        textMatch = true;
                    }
                });

                if (latLng && latLng.textContent.toLowerCase().includes(searchValue)) {
                    textMatch = true;
                }

                // Фильтр верификации через data-атрибут
                const isVerified = place.dataset.verified === 'true';
                let verifiedMatch = true;

                if (verifiedValue === 'verified') {
                    verifiedMatch = isVerified;
                } else if (verifiedValue === 'unverified') {
                    verifiedMatch = !isVerified;
                }

                place.style.display = (textMatch && verifiedMatch) ? '' : 'none';
            });
        }

        function openModal() {
            placeForm.reset();
            document.getElementById('action').value = 'add';
            placeModal.show();
        }

        function editPlace(index) {
            const place = <?= json_encode($places) ?>[index];
            const fields = ['name', 'lat', 'lng', 'shirt_description', 'description',
                           'link', 'instagram', 'maps_url', 'image', 'attributes'];

            fields.forEach(field => {
                document.getElementById(field).value = field === 'attributes'
                    ? place[field].join(',')
                    : place[field];
            });

            document.getElementById('action').value = 'edit';
            document.getElementById('index').value = index;
            document.getElementById('verified').checked = place.verified;
            placeModal.show();
        }

        function addAttribute(attribute) {
            let attributes = document.getElementById('attributes').value.split(',').map(s => s.trim());
            if (!attributes.includes(attribute)) {
                attributes.push(attribute);
            }
            document.getElementById('attributes').value = attributes.join(',');
        }

        async function sendRequest(formData) {
            try {
                const response = await fetch('', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.status === 'success') {
                    location.reload();
                }
                return data;
            } catch (error) {
                console.error('Error:', error);
            }
        }

        placeForm.addEventListener('submit', event => {
            event.preventDefault();
            sendRequest(new FormData(placeForm));
        });

        function deletePlace(index) {
            const formData = new FormData();
            formData.append('action', 'delete');
            formData.append('index', index);
            sendRequest(formData);
        }
    </script>
</body>
</html>
