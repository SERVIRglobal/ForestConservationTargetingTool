<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html>
<head>
<title><?php
$_GET['show'] = htmlspecialchars($_GET['show']);
echo( $_GET['show']);
?></title>
<meta content="text/html; charset=windows-1252" http-equiv=Content-Type>
<style type="text/css">
<!--
td {  font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 8pt; }
-->
</style>
</head>
<body bgColor="#ffffff" link="#000080" text="#000000" vLink="#000080">
<script language="javascript" type="text/javascript">
<!--
function emoticon(text) {
	text = ' ' + text + ' ';
	if (opener.document.forms['book'].gb_comment.createTextRange && opener.document.forms['book'].gb_comment.caretPos) {
		var caretPos = opener.document.forms['book'].gb_comment.caretPos;
		caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == ' ' ? text + ' ' : text;
		opener.document.forms['book'].gb_comment.focus();
	} else {
	opener.document.forms['book'].gb_comment.value  += text;
	opener.document.forms['book'].gb_comment.focus();
	}
}
//-->
</script>
<center>
<?php if($_GET['show'] == 'smilies')
{
?>
  <table width="95%" border="0" cellspacing="1" cellpadding="0">
    <tr>
      <td height="25">&iquest; Q U E&nbsp;&nbsp;&nbsp;S O N&nbsp;&nbsp;&nbsp;L O S&nbsp;&nbsp;&nbsp;S M I L I E S ?</td>
    </tr>
    <tr>
      <td>
        <p>Los 'smilies' o 'emoticones' son peque&ntilde;as im&aacute;genes gr&aacute;ficas que se pueden usar para transmitir una emoci&oacute;n o un sentimiento. Si has usado el correo electr&oacute;nico o el chat seguramente ya estar&aacute;s familiarizado con este concepto. Algunas cadenas de caracteres est&aacute;ndar se convierten autom&aacute;ticamente en smilies. Si no, inclina la cabeza hacia la izquierda; con un poco de imaginaci&oacute;n ver&aacute;s una carita que expresa un sentimiento.</p>
        <p>Esta es la lista de los smilies aceptados actualmente: </p>
      </td>
    </tr>
  </table>
  <table bgcolor=#f7f7f7 border=0 width="95%" cellspacing="1" cellpadding="4">
    <tbody>
    <tr>
      <td bgcolor="#996699"><font color="#FFFFFF"><b>Qu&eacute; escribir</b></font></td>
      <td bgcolor="#996699"><font color="#FFFFFF"><b>Gr&aacute;fico que aparecer&aacute;</b></font></td>
      <td bgcolor="#996699"><font color="#FFFFFF"><b>Emoci&oacute;n</b></font></td>
    </tr>

<?php include ("./smilies.inc"); ?>

    </tbody>
  </table>
<?php 
}
elseif ($_GET['show'] == 'agcode')
{
?>
  <table width="95%" border="0" cellspacing="1" cellpadding="0">
    <tr>
      <td height="25">&iquest;Q U E &nbsp;&nbsp;&nbsp;E S &nbsp;&nbsp;&nbsp;E L  &nbsp;&nbsp;&nbsp;A G C O D E? </td>
    </tr>
    <tr>
      <td>
        <p>El AGCode (C&oacute;digo AG o Advanced Guestbook Code) es una variaci&oacute;n de las etiquetas HTML, con las que posiblemente ya est&eacute;s familiarizado. B&aacute;sicamente, te permite a&ntilde;adir a tus mensajes funciones o estilos que normalmente necesitar&iacute;an HTML. Puedes usar AGCode aunque el HTML no est&eacute; habilitado en el libro de visitas. Podr&iacute;as querer usar AGCode en lugar de HTML aunque el HTML estuviera activado en el libro de visitas, ya que necesita menos c&oacute;digo y es m&aacute;s seguro de utilizar (si usas sintaxis incorrrecta no se producir&aacute;n tantos problemas).
        <p>C&oacute;digos AG actuales:
      </td>
    </tr>
  </table>
<table border="0" cellpadding="0" cellspacing="0" width="95%" align="center">
  <tbody>
  <tr>
    <td bgcolor="#000000">
      <table border="0" cellpadding="4" cellspacing="1" width="100%">
        <tbody>
        <tr bgcolor="#0099CC">
           <td><b><font color="#FFFFFF">V&iacute;nculos a URLs</font></b></td>
        </tr>
        <tr bgcolor="#FFFFFF">
          <td>Si AGCode est&aacute; activado, no tienes que usar el c&oacute;digo [URL] para crear un hiperv&iacute;nculo. Simplemente escribe el URL completo de alguna de las dos siguientes maneras y el hiperv&iacute;nculo se crear&aacute; autom&aacute;ticamente:
            <ul>
              <li><font color="#800000">http://www.tuURL.com </font>
              <li><font color=#800000>www.tuURL.com </font>Como ver&aacute;s puedes usar o la direcci&oacute;n completa http:// o la forma corta para los dominios www. Si el sitio no empieza por "www", debes usar la direcci&oacute;n completa "http://". Adem&aacute;s puedes usar los prefijos https y ftp en el modo de v&iacute;nculos autom&aacute;ticos (cuando AGCode est&aacute; activado). <br>
                <br>
              <li>Tambi&eacute;n puedes crear hiperv&iacute;nculos usando el c&oacute;digo [url]. Simplemente usa el formato siguiente: <br><br>
                <center>
                  <font color="#ff0000">[url=http://www.web.com]</font>hiperv&iacute;nculo<font color="#ff0000">[/url]</font>
                </center><br><br>
              <li>El antiguo c&oacute;digo [URL] seguir&aacute; funcionando, como se explica m&aacute;s abajo. Lo &uacute;nico que tienes que hacer es encerrar el v&iacute;nculo como en el siguiente ejemplo (el c&oacute;digo AG est&aacute; en <font color=#ff0000>rojo</font>).
                <p>
                  <center>
                    <font color=#ff0000>[url]</font>http://www.web.com<font color=#ff0000>[/url]</font>
                  </center>
                <p>En los ejemplos precedentes, el AGCode genera autom&aacute;ticamente un hiperv&iacute;nculo al URL encerrado. Tambi&eacute;n se asegurar&aacute; de que el v&iacute;nculo se abre en una nueva ventana cuando el usuario haga clic sobre &eacute;l. Recuerda que la parte "http://" es completamente opcional. En el segundo ejemplo de arriba, el URL enlazar&aacute; el texto con cualquier URL que pongas despu&eacute;s del signo igual. Recuerda por &uacute;ltimo que NO deber&iacute;as usar comillas dentro de la etiqueta URL. </p>              </li>
            </ul>
          </td>
        <tr bgcolor="#0099CC">
          <td><b><font color="#FFFFFF">V&iacute;nculos a direcciones de correo</font></b></td>
        </tr>
        <tr bgcolor="#FFFFFF">
          <td>Para a&ntilde;adir un v&iacute;nculo a una direcci&oacute;n de correo electr&oacute;nico dentro de tu mensaje, simplemente encierra la direcci&oacute;n de correo como en el siguiente ejemplo (AGCode en <font color=#ff0000>rojo</font>).
            <p>
              <center>
                <font color=#ff0000>[email]</font>webmaster@web.com<font color=#ff0000>[/email]</font>
              </center>
            <p>En este ejemplo, el AGCode genera autom&aacute;ticamente un hiperv&iacute;nculo a la direcci&oacute;n de correo encerrada. </p>
          </td>
        </tr>
        <tr bgcolor="#0099CC">
          <td><b><font color="#FFFFFF">Negrita e It&aacute;lica</font></b></td>
        </tr>
        <tr bgcolor="#FFFFFF">
          <td>Puedes poner texto en it&aacute;lica o en negrita encerr&aacute;ndolo entre etiquetas [i] [/i] o [b] [/b] ("i" para it&aacute;lica, "b" para negrita o "bold").
            <p>
              <center>
                Hola, <font color=#ff0000>[b]</font><b>Jos&eacute;</b><font color=#ff0000>[/b]</font><br><br>
                Hola, <font color=#ff0000>[i]</font><i>Mar&iacute;a</i><font color="#FF0000">[i]</font>
              </center>
          </td>
        </tr>
        <tr bgcolor="#0099CC">
          <td><b><font color="#FFFFFF">A&ntilde;adir Im&aacute;genes</font></b></td>
        </tr>
        <tr bgcolor="#FFFFFF">
          <td>Para insertar un gr&aacute;fico en tu mensaje simplemente encierra el URL de la imagen como se muestra en el siguiente ejemplo (AGCode en <font color="#ff0000">rojo</font>).
            <p>
              <center>
                <font color="#ff0000">[img]</font>http://www.tuURL.com/imagen/logo.gif<font color="#ff0000">[/img]</font>
              </center>
            <p>En este ejemplo, el AGCode hace que aparezca autom&aacute;ticamente el gr&aacute;fico en tu mensaje. Nota: la parte "http://" del URL es OBLIGATORIA para el c&oacute;digo <font color="#ff0000">[img]</font>.</p>
          </td>
        </tr>
        <tr bgcolor="#0099CC">
          <td><b><font color="#FFFFFF">A&ntilde;adir  Flash</font></b></td>
        </tr>
        <tr bgcolor="#FFFFFF">
          <td>Para insertar una animaci&oacute;n flash en tu mensaje simplemente encierra el URL del flash como se muestra en el siguiente ejemplo (AGCode en <font color="#FF0000">rojo</font>).
            <p>
              <center>
                <font color="#FF0000">[flash]</font>http://www.yourURL.com/image/funny.swf<font color="#FF0000">[/flash]</font><br>
                <font color="#FF0000">[flash]</font>http://www.youtube.com/watch?v=pz0XNGJ-ep8<font color="#FF0000">[/flash]</font>
              </center>
            <p>En el ejemplo anterior, el AGCode hace que autom&aacute;ticamente el flash sea visible en tu mensaje. Nota: la parte "http://" del URL es OBLIGATORIA para el c&oacute;digo <font color="#FF0000">[flash]</font>.</p>
          </td>
        </tr>
        </tbody>
      </table>
    </td>
  </tr>
  </tbody>
</table>
<table width="95%" border="0" cellspacing="1" cellpadding="4" align="center">
  <tr>
    <td><font color=#800000>Recuerda</font><br>
      No debes usar al mismo tiempo HTML y AGCode para llevar a cabo la misma funci&oacute;n. Recuerda tambi&eacute;n que AGCode no distingue entre may&uacute;sculas y min&uacute;sculas (es decir, puedes usar <font color="#ff0000">[URL]</font> o
      <font color=#ff0000>[url]</font>).<br><br>
      <font color="#800000">Usos Incorrectos de AGCode:</font> <br>
       <font color="#ff0000">[url]</font> www.web.com <font color="#ff0000">[/url]</font> - no pongas espacios entre los c&oacute;digos de corchetes y el texto al que est&aacute;s aplicando el c&oacute;digo.<br>
        <br>
        <font color="#ff0000">[email]</font>webmaster@web.com<font color="#ff0000">[email]</font> - los corchetes finales deben incluir una barra inclinada (<font color="#ff0000">[/email]</font>)    </td>
  </tr>
</table>
<?php
 } 
 else
 { 
 echo ("Nothing requested");
 }
 ?>
</center>
<br>
</body>
</html>