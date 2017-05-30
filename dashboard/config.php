<?php

//header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

$sqlserver 	= "tempstars.cj22hu7lczao.us-east-1.rds.amazonaws.com";
$sqluser 	= "tempstars_root";
$sqlpass 	= "aquarius22molar";
$sqldb 		= "tempstars_dev";
// $sqldb 		= "tempstars_prod";


mysql_connect($sqlserver, $sqluser, $sqlpass) or die("you couldn't connect to the mysql server.");
mysql_select_db($sqldb) or die("you couldn't select the mysql database.");

?>