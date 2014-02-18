<?php

$pdo = new PDO('mysql:host=5.199.151.136;dbname=search_test', 'PimVerlangen', 'verlangen');
$query = "SELECT s.* FROM site s "
        . "LEFT JOIN site_category sc ON s.id = sc.site_id "
        . "LEFT JOIN category c ON sc.category_id = c.id "
        . "LEFT JOIN site_language sl ON s.id = sl.site_id "
        . "LEFT JOIN language l ON sl.language_id = l.id ";

if (isset($_POST['showAll'])) {
    $query = "SELECT * FROM site";
} else {

    $catOpts;
    $langOpts;
    $keywords;
    $andor;
    $conditions = "";
    if (isset($_POST['catOpts'])) {

        $catOpts = $_POST['catOpts'];
    }

    if (isset($_POST['langOpts'])) {
        $langOpts = $_POST['langOpts'];
    }

    if (isset($_POST['keywords'])) {
        $keywords = $_POST['keywords'];
    }
    if (isset($_POST['andor'])) {
        $andor = $_POST['andor'];
    }
    if (isset($catOpts) || isset($langOpts) || isset($keywords)) {
        $conditions .= "WHERE ";
        if (isset($keywords)) {
            if (strlen($keywords) > 0) {
                $conditions .= "MATCH(s.name, s.description) AGAINST ('$keywords') OR "; // NEEDS TO BECOME PARAMETRIZED!
            }
        }
        if (isset($catOpts)) {
            for ($i = 0; $i < count($catOpts); $i++) {
                $conditions .= " c.id = " . $catOpts[$i] . " OR ";
            }
        }
        if (isset($langOpts)) {
            for ($i = 0; $i < count($langOpts); $i++) {
                $conditions .= " l.id = " . $langOpts[$i] . " OR ";
            }
        }
    }


    $conditions = substr($conditions, 0, strlen($conditions) - 3);
    $query = $query . $conditions . "GROUP BY s.id";
}
$statement = $pdo->prepare($query);
$statement->execute();
$results = $statement->fetchAll(PDO::FETCH_ASSOC);
$json = json_encode($results);
echo $json;
