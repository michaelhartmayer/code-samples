package Machinespark.Ventrilo 
{
  import fl.controls.List;
  import flash.display.MovieClip;
  import flash.events.Event;
  import flash.events.TimerEvent;
  import flash.net.URLLoader;
  import flash.net.URLRequest;
  import flash.net.URLVariables;
  import flash.utils.Timer;

  /**
   * ...
   * @author Michael Hartmayer
   */

  public class ServerStatus extends MovieClip {
    
    public var SecondsBetweenUpdates:Number   = 5;
    
    private var UpdateURL:String        = 'http://ventrilostatus.net/xml/';
    private var ProxyURL:String         = 'http://www.michaelhartmayer.com/!Proxy/Proxy.php?GET=';
    private var UpdateTimer:Timer;
    private var VentHost:String;
    private var VentPort:int;
    private var VentRequest:URLLoader;
    private var TargetList:List;
    private var OldRequestData:XML;
    
    public function ServerStatus() {
      TargetList = List(this.ClientList);
      UpdateTimer = new Timer(SecondsBetweenUpdates * 1000);
    }
    
    public function UpdateServerStatus(sHost:String, iPort:uint):void {     
      VentRequest = new URLLoader();
      VentRequest.addEventListener(Event.COMPLETE, ShowServerStatus);
      UpdateTimer.addEventListener(TimerEvent.TIMER, RequestUpdate);
      
      VentHost = sHost;
      VentPort = iPort;
      
      RequestUpdate();
      UpdateTimer.start();
    }
    
    public function StopUpdate():void {
      UpdateTimer.stop();
    }
    
    private function RequestUpdate(evt:TimerEvent = null):void {
      var RequestURL:String = UpdateURL + '/' + VentHost + ':' + VentPort + '/?' + new Date().getTime();
      var ProxyURL:String = ProxyURL + RequestURL;
        VentRequest.load(new URLRequest(ProxyURL));
    }
    
    private function ShowServerStatus(evt:Event):void {
      var ResponseData:XML = XML(evt.target.data);
      
      TargetList.removeAll();
      OldRequestData = ResponseData;

      var infServerName:String          = ResponseData.@name;
      var infServerComment:String       = ResponseData.@comment;
      var infServerMaxClients:String    = ResponseData.@maxclients;
      var infServerChannelCount:String  = ResponseData.@channelcount;
      var infServerClientCount:String   = ResponseData.@clientcount;
      
      this.txtServerStatus.text = infServerName + "\n" + infServerClientCount + " / " + infServerMaxClients + "\n" + infServerChannelCount;
      
      BuildChannels(ResponseData, 0);
    }
  
    private function BuildChannels(ResponseData:XML, ChannelDepth:Number = 0):void {
      for (var i:Number = 0; i < ResponseData.channel.length(); i++) {
        
        // Add Channel
        var ChannelString:String = AddString("   ", ChannelDepth) + ' + ' + ResponseData.channel[i].@name;
          TargetList.addItem({ label:ChannelString });
          
        // Add Clients
        for (var j:Number = 0; j < ResponseData.channel[i].client.length(); j++) {
          var ClientString:String = AddString("     ", ChannelDepth) + '   - ' + ResponseData.channel[i].client[j].@name;
            TargetList.addItem({ label:ClientString });
        }
        
        // Build Sub Channels
        BuildChannels(ResponseData.channel[i], ChannelDepth+1);
      }
    }
    
    private function AddString(sChars:String, iRepeatCount:Number = 0):String {
      var sRepeat:String = '';
      while (iRepeatCount--) {
        sRepeat += sChars;
      }
      return sRepeat;
    }

  }
}
