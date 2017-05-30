<?php

session_start();

require("config.php");

if (!isset($_SESSION['dashboard_username']) || !isset($_SESSION['dashboard_password']))
  header("Location: index.php");

if (isset($_GET['sort']) && $_GET['sort'] != "")
  $sort = $_GET['sort'];
else
  $sort = "postedOn";

if (isset($_GET['order']) && $_GET['order'] != "")
  $order = $_GET['order'];
else
  $order = "DESC";

date_default_timezone_set('America/New_York');
$curDate = date('Y-m-d h:i:s', time());

// update timestamp for when dentist or hygienst registeres his name.
$sql = "UPDATE User SET registerTimestamp = '" . $curDate . "' WHERE registerTimestamp IS NULL";
mysql_query($sql);

// update timestamp for when dentist completes sign-up.
$sql = "UPDATE Dentist SET registerTimestamp = '" . $curDate . "' WHERE registerTimestamp IS NULL";
mysql_query($sql);

// update timestamp for when hygienist completes sign-up.
$sql = "UPDATE Hygienist SET registerTimestamp = '" . $curDate . "' WHERE registerTimestamp IS NULL";
mysql_query($sql);

// update timestamp for when dentist posts a job.
$sql = "UPDATE Job SET postTimestamp = '" . $curDate . "' WHERE postTimestamp IS NULL";
mysql_query($sql);

// update timestamp for when hygienist accepts a job.
$sql = "UPDATE Job SET acceptTimestamp = '" . $curDate . "' WHERE acceptTimestamp IS NULL AND postTimestamp IS NOT NULL AND hygienistId <> 0";
mysql_query($sql);

// update timestamp for when hygienist submit a custom offer.
$sql = "UPDATE PartialOffer SET submitTimestamp = '" . $curDate . "' WHERE submitTimestamp IS NULL";
mysql_query($sql);

// get dashboard info.
$sql = "
        (SELECT registerTimestamp as postedOn, '' as id, '' as name, '' as city, email, 'dentist registered' as action, '' as dName, '' as dCity, '' as dEmail, '' as shiftDate, '' as postedStart, '' as postedEnd, '' as offerStart, '' as offerEnd, '' as starScore, '' as hourlyRate, '' as graduationYear, '' as school, '' as CDHONumber, '' as inviteBonus
          FROM User
          WHERE dentistId > 0)
        UNION ALL
        (SELECT U.registerTimestamp as postedOn, '' as id, '' as name, '' as city, U.email, 'hygienist registered' as action, '' as dName, '' as dCity, IF(U1.email IS NOT NULL, CONCAT('invited by ', U1.email), '') as dEmail, '' as shiftDate, '' as postedStart, '' as postedEnd, '' as offerStart, '' as offerEnd, '' as starScore, '' as hourlyRate, '' as graduationYear, '' as school, '' as CDHONumber, '' as inviteBonus
          FROM User AS U
          LEFT JOIN Invite AS I ON U.id = I.invitedUserId
          LEFT JOIN User AS U1 ON U1.inviteCode = I.inviteCode
          WHERE U.hygienistId > 0
          GROUP BY U.hygienistId)
        UNION ALL
        (SELECT D.registerTimestamp as postedOn, '' as id, D.practiceName as name, D.city as city, U.email as email, 'dentist completed sign-up' as action, D.postalCode as dName, '' as dCity, '' as dEmail, '' as shiftDate, '' as postedStart, '' as postedEnd, '' as offerStart, '' as offerEnd, '' as starScore, '' as hourlyRate, '' as graduationYear, D.lat as school, D.lon as CDHONumber, '' as inviteBonus
          FROM Dentist AS D
          INNER JOIN User AS U ON U.dentistId = D.id
          WHERE D.city IS NOT NULL)
        UNION ALL
        (SELECT H.registerTimestamp as postedOn, '' as id, CONCAT(H.firstName, ' ', H.lastName) AS name, H.city as city, U.email as email, 'hygienist completed sign-up' as action, H.postalCode as dName, H.placements as dCity, IF(U1.email IS NOT NULL, CONCAT('invited by ', U1.email), '') as dEmail, '' as shiftDate, '' as postedStart, '' as postedEnd, '' as offerStart, '' as offerEnd, '' as starScore, '' as hourlyRate, '' as graduationYear, H.lat as school, H.lon as CDHONumber, '' as inviteBonus
          FROM Hygienist AS H
          INNER JOIN User AS U ON U.hygienistId = H.id
          LEFT JOIN Invite AS I ON U.id = I.invitedUserId
          LEFT JOIN User AS U1 ON U1.inviteCode = I.inviteCode
          WHERE H.city IS NOT NULL
          GROUP BY H.id)
        UNION ALL
        (SELECT J.acceptTimestamp as postedOn, J.id, CONCAT(H.firstName, ' ', H.lastName) AS name, H.city, U.email, 'accepted a job' as action, D.practiceName as dName, D.city as dCity, DU.email as dEmail, S.shiftDate, S.postedStart, S.postedEnd, '' as offerStart, '' as offerEnd, H.starScore, J.hourlyRate, H.graduationYear, H.school, H.CDHONumber, getInviteBonus(U.id) as inviteBonus
          FROM Job AS J
          INNER JOIN Hygienist AS H ON J.hygienistId = H.id
          INNER JOIN User AS U ON J.hygienistId = U.hygienistId
          INNER JOIN Shift AS S ON J.id = S.jobId
          INNER JOIN Dentist AS D ON J.dentistId = D.id
          INNER JOIN User AS DU ON J.dentistId = DU.dentistId
          WHERE J.hygienistId > 0)
        UNION ALL
        (SELECT J.postTimestamp as postedOn, J.id, D.practiceName as name, D.city as city, U.email as email, 'posted a job' as action, '' as dName, '' as dCity, '' as dEmail, S.shiftDate, S.postedStart, S.postedEnd, '' as offerStart, '' as offerEnd, '' as starScore, '' as hourlyRate, '' as graduationYear, '' as school, '' as CDHONumber, '' as inviteBonus
          FROM Job AS J
          INNER JOIN Dentist AS D ON J.dentistId = D.id
          INNER JOIN User AS U ON J.dentistId = U.dentistId
          INNER JOIN Shift AS S ON J.id = S.jobId)
        UNION ALL
        (SELECT P.submitTimestamp as postedOn, J.id, CONCAT(H.firstName, ' ', H.lastName) AS name, H.city, U.email, 'submitted custom offer' as action, D.practiceName as dName, D.city as dCity, DU.email as dEmail, S.shiftDate, '' as postedStart, '' as postedEnd, P.offeredStartTime as offerStart, P.offeredEndTime as offerEnd, '' as starScore, P.hourlyRate, '' as graduationYear, '' as school, '' as CDHONumber, '' as inviteBonus
          FROM PartialOffer AS P
          INNER JOIN Job AS J ON J.id = P.jobId
          INNER JOIN Hygienist AS H ON P.hygienistId = H.id
          INNER JOIN User AS U ON P.hygienistId = U.hygienistId
          INNER JOIN Shift AS S ON J.id = S.jobId
          INNER JOIN Dentist AS D ON J.dentistId = D.id
          INNER JOIN User AS DU ON J.dentistId = DU.dentistId)
        UNION ALL
        (SELECT J.acceptTimestamp as postedOn, J.id, D.practiceName AS name, D.city, DU.email, 'accepted custom offer' as action, CONCAT(H.firstName, ' ', H.lastName) as dName, H.city as dCity, U.email as dEmail, S.shiftDate, '' as postedStart, '' as postedEnd, S.actualStart as offerStart, S.actualEnd as offerEnd, '' as starScore, J.hourlyRate, '' as graduationYear, '' as school, '' as CDHONumber, '' as inviteBonus
          FROM Job AS J
          INNER JOIN Hygienist AS H ON J.hygienistId = H.id
          INNER JOIN User AS U ON J.hygienistId = U.hygienistId
          INNER JOIN Shift AS S ON J.id = S.jobId
          INNER JOIN Dentist AS D ON J.dentistId = D.id
          INNER JOIN User AS DU ON J.dentistId = DU.dentistId
          WHERE J.hygienistId > 0 AND S.type = 2)
        ";

$sql .= "ORDER BY " . $sort . " " . $order;
$result = mysql_query($sql);

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Dashboard</title>
<link rel="stylesheet" type="text/css" href="css/style.css?version=3" />
</head>
  <body>
    <div id="main">

      <h2>Dashboard&nbsp;&nbsp;&nbsp;&nbsp;<input type="button" value="Refresh" onClick="window.location.reload()"></h2>

      <?php
        $header_texts = ['Time/Date Stamp', 'Job ID', 'Who Subject', 'Subject City', 'Subject Email', 'Action', 'Who Object', 'Object City', 'Object E-mail', 'Shift Date', 'Shift Start Time', 'Shift End Time', 'Offered Start Time', 'Offerred End Time', 'Ranking', 'Rate', 'Grad Year', 'School', 'CDHO#', 'Invite Bonus'];
        $sort_texts = ['postedOn', 'id', 'name', 'city', 'email', 'action', 'dName', 'dCity', 'dEmail', 'shiftDate', 'postedStart', 'postedEnd', 'offerStart', 'offerEnd', 'starScore', 'hourlyRate', 'graduationYear', 'school', 'CDHONumber', 'inviteBonus'];
      ?>
      <table>
       <tr>
        <?php
          for($i = 0; $i < count($header_texts); ++$i) {
            if ($sort_texts[$i] != "") {
              if ($sort == $sort_texts[$i]) {
                if ($order == "DESC")
                  echo "<th><a href='?sort=" . $sort_texts[$i] . "&order=ASC'>" . $header_texts[$i] . "</a></th>";
                else
                  echo "<th><a href='?sort=" . $sort_texts[$i] . "&order=DESC'>" . $header_texts[$i] . "</a></th>";
              }
              else
                echo "<th><a href='?sort=" . $sort_texts[$i] . "'>" . $header_texts[$i] . "</a></th>";
            }
            else
              echo "<th><a href=''>" . $header_texts[$i] . "</a></th>";
          }
        ?>
       </tr>

      <?php
        if ($result != null) {
          while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
            ?>
            <tr>
            <?php
              foreach($sort_texts as $item) {
                if ($item != '' && $row[$item] != NULL) {
                  if ($item == 'shiftDate') {
                    $new_date = date('F jS', strtotime($row['shiftDate']));
                    echo "<td>" . $new_date . "</td>";
                  }
                  else if ($item == 'postedStart' || $item == 'postedEnd' || $item == 'offerStart' || $item == 'offerEnd')
                    echo "<td>" . (new DateTime($row[$item]))->format('g:ia') . "</td>";
                  else if ($item != '')
                    echo "<td>" . $row[$item] . "</td>";
                }
                else
                  echo "<td>" . "" . "</td>";
              }
            ?>
            </tr>
            <?php
          }
        }
        if ($result != null)
          mysql_free_result($result);
      ?>
      </table>
    </div>
  </body>
</html>
