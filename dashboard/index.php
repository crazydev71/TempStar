<?php

session_start();

require("config.php");

$show_message = false;

// if (isset($_SESSION['admin_user_index']))
//  header("Location: user_manage.php");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $username = $_POST['username'];
  $password = $_POST['password'];

  if ($username == "" || $username == null || $password == "" || $password == null) {
    $show_message = true;
  }
  else {
    $sql = "SELECT * from Admin where username='$username' and password='$password'";
    $result = mysql_query($sql);
    $count = 0;
    $row = null;
    
    if ($result != null) {
      $row = mysql_fetch_array($result);
      $count = mysql_num_rows($result);
    }
    
    if ($count == 1) {
      $_SESSION['dashboard_username'] = $username;
      $_SESSION['dashboard_password'] = $password;

      header("Location: dashboard.php");
    }
    else {
      $show_message = true;
    }
    
    if ($result != null) {
      mysql_free_result($result);
    }
  }
}

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Login</title>
<link rel="stylesheet" type="text/css" href="css/style.css?version=3" />
</head>

<body>

<div id="main">
  
  <form class="login-form" method="post" action="index.php">
    <div id="login_wrapper">
      <div id="login_box">
        <div id="login_message" <?php if ($show_message == false) echo 'style="visibility: hidden"' ?> >Username or Password is not valid.</div>
        <div class="field-wrapper">
          <div class="input-title">Username</br></label>
          <input class="input-field" name="username" type="text" id="user_field" placeholder="" value="<?php if (isset($_POST['username'])) echo $_POST['username'] ?>" />
        </div>
        <div class="field-wrapper">
          <div class="input-title">Password</br></label>
          <input class="input-field" name="password" type="password" id="password_field" placeholder="" value="<?php if (isset($_POST['password'])) echo $_POST['password'] ?>" />
        </div>
        <input id="login_btn" class = "dlg_btn" type="submit" value="Login" />
      </div>
    </div>
  </form>

</div>

</body>
</html>
