<?php
  class Db {

    private static $singleton;
    private $ref;
    private $config = array();
    private $errors = array();

    public function __constructor () {}

    // returns instance of Db
    public static function getInstance () {
      if (!self::$singleton) self::$singleton = new self();
      return self::$singleton;
    }

    // accepts array of: host, username, password, db
    public function config ($config) {
      $this->config = $config;
      return $this;
    }

    public function connect () {
      $this->ref = mysql_connect(
        $this->config['host'],
        $this->config['username'],
        $this->config['password'],
        true
      );

      // connection to server successful? return false
      if (!$this->ref) $this->error();

      // connection to db successful? return true
      if (mysql_select_db($this->config['db'])) return true;

      // connection to db unsuccessful. return false
      return $this->error();
    }

    public function cleanString ($str) {
      if ($this->ref) return mysql_real_escape_string($str, $this->ref);
      return false;
    }

    public function set ($query) {
      if (!mysql_query($query, $this->ref)) return $this->error();
      return true;
    }

    public function get ($query) {
      $r = mysql_query($query, $this->ref);
      if (!$r) return $this->error();

      $rows = array();
      while ($row = mysql_fetch_array($r, MYSQL_ASSOC)) {
        $rows[] = $row;
      }

      return $rows;
    }

    public function count ($table, $where) {
      $query = "SELECT COUNT(*) AS 'COUNT' FROM `$table` WHERE `$where`";
      $r = $this->get($query);
      return $r[0]['COUNT'];
    }

    public function errors () {
      return $this->errors;
    }

    private function error () {
      array_push($this->errors, mysql_error());
      return false;
    }

  }
?>
