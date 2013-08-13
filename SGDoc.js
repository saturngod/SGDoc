#!/usr/bin/env node

var fs = require('fs');
var marked = require( "marked" );
var hljs = require('highlight.js');
var cheerio = require('cheerio');

var template = "";

if(process.argv.length < 4 || process.argv.length > 5) {
    console.info("Command :");
    console.info("SGDoc [input markdown] [output file] [template] ");
    return;    
}

if(process.argv.length==4)
{
    template = __dirname + "/template.html";
}
else {
    template = process.argv[4];   
}

var filename = process.argv[2];
var markdownText = fs.readFileSync(filename,"utf8");

var docCode = marked(markdownText);

$ = cheerio.load(docCode);

$('code').each(function(i, elem) {
   var code  = $(this).text();
   
   var res = hljs.highlightAuto(code).value;

   $(this).html(res);
});

var header = ["h1","h2","h3","h4","h5","h6"];


for(var k=0;k<header.length;k++)
{
    $(header[k]).each(function(i,e){
        $(this).addClass(header[k]);
    });
}

function rec(current,index,array,disable)
{
    if(array.length == index)
    {
        return "";
    }

    list +="<ul>";
    $(current).nextAll().each(function(k,e){
        if($(e).hasClass(disable))
        {
            return false;
        }
        else if($(e).hasClass(array[index]))
        {
            list += "<a href='#"+$(this).text()+""+inc+"'><li>"+$(this).text()+"</li></a>";
            $(this).before("<a name='"+$(this).text()+ inc + "'></a>");
            inc++;
            rec(this,index+1,array,array[index]);
        }
    });
    list +="</ul>";
}

var startTag = 'h1'
var startIndex = 1;
if($('h1').length == 0) {
   startTag = 'h2';
    startIndex = 2;
}


var list = "<ul>";
inc = 1;
$(startTag).each(function(i,elem) {

    list += "<a href='#"+$(this).text()+""+inc+"'><li>"+$(this).text()+"</li></a>";
    $(this).before("<a name='"+$(this).text()+ inc + "'></a>");
    inc++;
    rec(this,startIndex,header,startTag);
});

list +="</ul>";

docCode = $.html();



template = fs.readFileSync(template,"utf8");
template = template.replace("{{docCode}}",docCode);
template = template.replace("{{toc}}",list);

var outputFileName = process.argv[3];

fs.writeFileSync(outputFileName,template,"utf8");
