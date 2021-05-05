<?php

	if (empty($_COOKIE['id_tabunnikova']))
	{
		$id = rand();
		setcookie('id_tabunnikova', $id);
	}
	else $id = $_COOKIE['id_tabunnikova'];

	if ($id % 2 == 0) echo "<script>document.location.href='https://flashyfire.github.io/ITMO-NavSurvey/IfmoNav3D/index.html'</script>";
	else echo "<script>document.location.href='https://flashyfire.github.io/ITMO-NavSurvey/IfmoNav2D/index.html'</script>";
?>