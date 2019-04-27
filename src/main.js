/*
 * Sample plugin scaffolding for Adobe XD.
 *
 * Visit http://adobexdplatform.com/ for API docs and more sample code.
 */
const { alert, error } = require("./lib/dialogs.js");
const shell = require("uxp").shell;
var {Rectangle, Color} = require("scenegraph");

function convertTo(format, color) {
    if(format == 'hex')
    {
      return "#" + (color & 0x00FFFFFF).toString(16).padStart(6, '0');
    } 
    else 
    {
      alert('Other color formats not supported yet');
    }
  }

function exportToClipboard(colors, styles)
{
  let stringToCopy = "";
  stringToCopy += "<!-- Colors -->\r\n"
  stringToCopy += colors;
  stringToCopy += "\r\n";
  stringToCopy += "<!-- Styles -->\r\n"
  stringToCopy += styles;
  stringToCopy += "\r\n";

  let clipboard = require("clipboard");
  clipboard.copyText(stringToCopy);
}

function getCharacterAssets()
{
  var assets = require("assets"),
  allStyles = assets.characterStyles.get();

  let styles = "";

  for (var i = 0; i < allStyles.length; i++)
  {
    // get style name or create one
    let styleName = (allStyles[i]['name'] == undefined) ? "Style" + i : allStyles[i]['name'];

    // get the style information
    let charStyle = allStyles[i]['style'];

    // create the style entry
    let styleDef = "";
    styleDef += "<Style x:Key=\"" + styleName + "\" TargetType=\"Label\">\r\n";
    styleDef += "\t<Setter Property=\"FontFamily\" Value=\"" + charStyle["fontFamily"] + "\"/>\r\n"; 
    styleDef += "\t<Setter Property=\"FontSize\" Value=\"" + charStyle["fontSize"] + "\"/>\r\n"; 
    styleDef += "\t<Setter Property=\"TextColor\" Value=\"" + charStyle["fill"].toHex(true) + "\"/>\r\n"; 
    styleDef += "</Style>\r\n\r\n";
   
    styles +=styleDef;
  }
  return styles;
}

function getColors() {

    var assets = require("assets"),
    allColors = assets.colors.get();
  
    let colors = "";

    // Loop over all colors in Assets and concetenate to string
    for (var i = 0; i < allColors.length; i++) 
    {
      // get color hex value
      let newColor = convertTo('hex', allColors[i]['color']['value']);

      // get color name or create one
      let colorName = (allColors[i]['name'] == undefined) ? "Color" + i : allColors[i]['name'];

      // create resource string
      colors += "<Color x:Key=\"" + colorName + "\">" + newColor + "</Color>\r\n";
    }
    return colors;
  }

function myPluginCommand(selection) {
  const colors = getColors();
  const styles = getCharacterAssets();
  exportToClipboard(colors, styles);
  alert('Successfully Copied to Clipboard', 'All colors and styles copied as XAML to your clipboard.');
}

module.exports = {
    commands: {
        myPluginCommand: myPluginCommand
    }
};
