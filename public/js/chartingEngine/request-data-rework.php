<?php

$url = $_POST['url'];
$contents = file_get_contents($url);
if ($contents === FALSE) {
    echo "No valid data found.";
} else {
    echo $contents;
}