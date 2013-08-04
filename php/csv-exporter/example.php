<?php
  $CSV = new CSVMaker();
   
  // Optionally Change the Format
  $CSV->csvDelimeter  = ",";  // (What seperates each value in a set Foo,Bar,Etc)
  $CSV->csvLine       = "\n"; // (What ends one set of data - usually a new line)
  $CSV->csvCapsule    = '"';  // (What comes before and after each piece of data "Foo","Bar","Etc")
   
  $CSVHeader = array();
  $CSVHeader['first_name']  = "First Name";
  $CSVHeader['last_name']   = "Last Name";
   
  $CSV->createTemplate($CSVHeader);
   
  $CSVLine = array();
  $CSVLine['first_name']  = "Michael";
  $CSVLine['last_name']   = "Hartmayer";
   
  $CSV->addEntry($CSVLine);
   
  file_put_contents("MyCSVFile.csv",$CSV->buildDoc());
?>
