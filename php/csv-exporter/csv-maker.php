<?php
  class CSVMaker {
    public $csvDelimeter  = "\t";
    public $csvLine     = "\r\n";
    public $csvCapsule    = '"';
    
    private $csvTemplate  = array();
    private $csvCollection  = array();
    private $csvDocument;
    
    public function createTemplate ($arr=array()) {
      $this->csvTemplate = $arr;
    }
    
    public function addEntry ($arr=array()) {
      foreach($arr as $Index=>$Value) {
        $arr[$Index] = $this->csvCapsule.str_replace($this->csvCapsule,$this->csvCapsule.$this->csvCapsule,$Value).$this->csvCapsule;
      }
      $this->csvCollection[] = $arr;
    }
    
    public function buildDoc () {
      $docLine = '';
      $csvTemplate = $this->csvTemplate;
      
      // Add Header
      foreach($csvTemplate as $Index=>$Title) {
        $csvTemplate[$Index] = $this->csvCapsule.str_replace($this->csvCapsule,$this->csvCapsule.$this->csvCapsule,$Title).$this->csvCapsule;
      }
      $docLine.=implode($this->csvDelimeter,$csvTemplate).$this->csvLine;
      
      // Add CSV Information
      foreach ($this->csvCollection as $csvCollectionItem) {
        $collectionDeposit = array();
        foreach ($csvTemplate as $Index=>$Title) {
          $collectionDeposit[] = $csvCollectionItem[$Index];
        }
        
        $docLine .= implode($this->csvDelimeter,$collectionDeposit) . $this->csvLine;
      }
      
      return $docLine;
    }
  }//end:class
?>
