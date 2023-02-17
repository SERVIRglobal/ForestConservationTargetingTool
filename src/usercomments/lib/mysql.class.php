<?php 
/*
 * ----------------------------------------------
 * Lazarus Guestbook
 * by Stewart Souter
 * URL: www.carbonize.co.uk 
 * Based on Advanced Guestbook 2.3.x (PHP/MySQL)
 * Copyright (c)2001 Chi Kien Uong
 * URL: http://www.proxy2.de
 * Last Modified: Sat, 27 July 2013 10:22:18 GMT
 * ----------------------------------------------
 */

class gbook_sql
{

  var $conn_id;
  var $result;
  var $record;
  var $db = array();
//  var $port;

  function gbook_sql()
  {
    global $GB_DB;
    $this->db =& $GB_DB;
  }

  function connect()
  {
    $this->conn_id = @mysql_connect($this->db['host'],$this->db['user'],$this->db['pass']);
    if (!$this->conn_id)
    {
      $this->sql_error('Connection Error');
    }
    if (!mysql_select_db($this->db['dbName'], $this->conn_id))
    {
      $this->sql_error('Database Error');
    }
    return $this->conn_id;
  }

  function query($query_string)
  {
    $this->result = @mysql_query($query_string, $this->conn_id);
    if (!$this->result && !IS_INSTALLER)
    {
      $this->sql_error('Query Error', $query_string);
    }
    return $this->result;
  }

  function fetch_array($query_id)
  {
    $this->record = mysql_fetch_assoc($query_id);
    return $this->record;
  }
  
  function fetch_row($query_id)
  {
    $this->record = mysql_fetch_row($query_id);
    return $this->record;
  }

  function num_rows($query_id)
  {
    return ($query_id) ? mysql_num_rows($query_id) : 0;
  }

  function num_fields($query_id)
  {
    return ($query_id) ? mysql_num_fields($query_id) : 0;
  }

  function free_result($query_id)
  {
    return mysql_free_result($query_id);
  }

  function affected_rows()
  {
    return mysql_affected_rows($this->conn_id);
  }
  
  function insert_id()
  {
    return mysql_insert_id($this->conn_id);
  }
  
  function escape_string($str)
  {
    return mysql_real_escape_string($str, $this->conn_id);
  }

  function close_db()
  {
    if($this->conn_id)
    {
      return mysql_close($this->conn_id);
    }
    else
    {
      return false;
    }
  }
  
  function selfURL() 
  { 
    $s = empty($_SERVER["HTTPS"]) ? '' : ($_SERVER["HTTPS"] == "on") ? "s" : "";
    $protocol = substr(strtolower($_SERVER["SERVER_PROTOCOL"]), 0, strpos(strtolower($_SERVER["SERVER_PROTOCOL"]), '/')).$s; 
    $port = ($_SERVER["SERVER_PORT"] == "80") ? "" : (":".$_SERVER["SERVER_PORT"]); 
    return $protocol."://".$_SERVER['SERVER_NAME'].$port.$_SERVER['REQUEST_URI']; 
  }

  function sql_error($message, $query_string='')
  {
    global $TEC_MAIL;
    if(!defined(IS_INSTALLER))
    {
      // Some plain English messages for known errors
      $knownCodes = array(
        1045 => 'Either the database username or password you have supplied in the config.inc.php file is incorrect',
        1146 => 'One or more database tables are missing. Have you installed them? If not you need to visit install.php.'
      );
      $description = ($this->conn_id) ? mysql_error($this->conn_id) : 'unknown error';
      $number = ($this->conn_id) ? mysql_errno($this->conn_id) : 0;
      $error  = "<b>MySQL Error </b> : $message\n";
      $error .= (!empty($query_string)) ? "<b>Query     </b>   : $query_string\n" : '';
      $error .= "<b>Error Number</b> : $number $description\n";
      $error .= "<b>Requested URI</b>: ".$this->selfURL()."\n";
      $error .= "<b>Date      </b>   : ".date("D, F j, Y H</b>:i</b>:s")."\n";
      $error .= "<b>IP       </b>    : ".$_SERVER['REMOTE_ADDR']."\n";
      $error .= "<b>Browser    </b>  : ".$_SERVER['HTTP_USER_AGENT']."\n";
      $error .= "<b>Referer    </b>  : ".getenv("HTTP_REFERER")."\n";
      $error .= "<b>PHP Version </b> : ".PHP_VERSION."\n";
      $error .= "<b>OS       </b>    : ".PHP_OS."\n";
      $error .= "<b>Server    </b>   : ".getenv("SERVER_SOFTWARE")."\n";
      $error .= "<b>Server Name </b> : ".getenv("SERVER_NAME")."\n";
      echo (isset($knownCodes[$number])) ? '<h3>'.$message.'</h3><h4>'.$knownCodes[$number]."</h4><hr>\n" : '<h3>'.$message.'</h3><hr>';
      echo '<pre>'.$error.'</pre>';
      if (preg_match('/^[_a-z0-9-]+(\\.[_a-z0-9-]+)*@([0-9a-z][0-9a-z-]*[0-9a-z]\\.)+[a-z]{2,5}$/i', $TEC_MAIL))
      {
        $headers = 'From: '.$TEC_MAIL."\nX-Mailer: Lazarus Guestbook";
        $error = (isset($knownCodes[$number])) ? $knownCodes[$number] . "\n\n" . $error : $error;
        @mail($TEC_MAIL,'Guestbook - Error',strip_tags($error),$headers);
      }
      exit();
    }
  }

}

?>