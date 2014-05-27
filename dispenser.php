<?php
$data = file_get_contents("dispenser_jobs");
$data=(int)$data;
echo ++$data;
file_put_contents("dispenser_jobs", $data);
?>