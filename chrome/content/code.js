// SPREF1.6 :: CodeBurner for Firebug v1.6
//******************************************************************************
// Copyright (c) 2010 SitePoint Pty Ltd. -- http://www.sitepoint.com/
// Written by brothercake -- http://www.brothercake.com/
//******************************************************************************
// This is scripting for the page inside the code example iframe
//******************************************************************************



//add syntax highlighting to a code block
function addSyntaxHighlighting(block)
{
	//get the code block html 
	var html = block.innerHTML;
	
	//switch by code type
	switch(true)
	{
		//html 
		case /\-(elements|attributes)\-/.test(location.hash) : 

			//double-quoted attributes
			html = html.replace(/([ ]?[a-z\:\-]+=)(\"[^\"]*\")/igm, '<span class="codeAttr">$1</span><span class="codeVal">$2</span>');
	
			//doctype [iirc only occurs once, in the html element example]
			html = html.replace(/(&lt;\!DOCTYPE[^&]+&gt;)/m, '<span class="codeDoctype">$1</span>');

			//comments [ditto]
			html = html.replace(/(&lt;\!\-\-.*\-\-&gt;)/igm, '<i class="codeComment">$1</i>');
		
			//open tags
			html = html.replace(/(&lt;)([\/]?)([a-z1-6\?]+)/igm, '<span class="codeElement">$1$2$3</span>');
	
			//close tags
			html = html.replace(/([\/\?]?&gt;)/igm, '<span class="codeElement">$1</span>');
			
			break;
			
		//css properties and selectors
		//the parsing here doesn't need to cater for all the complicated caveats 
		//that we did when extracting selectors from the cssview
		//because we're working with known code examples and limited, predictable syntax
		case /\-(properties|selectors)\-/.test(location.hash) :

			//double-quoted strings
			html = html.replace(/(\"[^\"]*\")/igm, '<span class="codeValue">$1</span>');
	
			//selectors
			html = html.replace(/^([^\{]+)(\{)/igm, '<span class="codeSelector">$1</span>$2');
	
			//property/value pairs
			html = html.replace(/([a-z\-]+: )([^;]+;)/igm, '<span class="codeProperty">$1</span><span class="codeValue">$2</span>');
			
			//@media 
			html = html.replace(/(@media [^\{]+)([\{])/igm, '<span class="codeAtrule">$1</span>$2');
	
			//pseudo-nodes
			//we're doing this great long selector instead of a general pattern match purely to avoid 
			//matching "progid:DXImageTransform". I know it seems like quite a length to go to, 
			//but this is an educational resource - we have to get it right
			html = html.replace(/([:]((link|visited|active|hover|focus|lang|root|empty|target|enabled|disabled|checked|not|before|after|selection)|(first|last|only|nth)(\-last)?\-(child|letter|line|of\-type))(\(([^\)]*)\))?)/igm, '<span class="codePseudo">$1</span>');
	
			//"declarations" 
			html = html.replace(/^([\s]*[⋮][\s]*(?:declarations)[\s]*)$/igm, '<span class="codeDeclarations">$1</span>');
	
			//braces
			html = html.replace(/([\{\}])/igm, '<span class="codeBrace">$1</span>');
			
			//the :empty pseudo-class example contains HTML
			if(/\-selectors\-pseudoclass/.test(location.hash))
			{
				//open tags
				html = html.replace(/(&lt;)([\/]?)([a-z1-6\?]+)/igm, '<span class="codeElement">$1$2$3</span>');
		
				//close tags
				html = html.replace(/([\/\?]?&gt;)/igm, '<span class="codeElement">$1</span>');
			}
	
			break;
			
		//css at-rules
		case /\-(atrules)\-/.test(location.hash) :

			//selectors
			html = html.replace(/^([^\{]+)(\{)/igm, '<span class="codeSelector">$1</span>$2');
	
			//property/value pairs
			html = html.replace(/([a-z\-]+: )([^;]+;)/igm, '<span class="codeProperty">$1</span><span class="codeValue">$2</span>');
			
			//@media 
			html = html.replace(/(@media [^\{]+)([\{])/igm, '<span class="codeAtrule">$1</span>$2');
			
			//@charset, @import and @namespace
			html = html.replace(/(@(charset|import|namespace)[^;]+)(;)/igm, '<span class="codeAtrule">$1$3</span>');
			
			//@font-face and @page
			html = html.replace(/(@(font\-face|page))([ \{])/igm, '<span class="codeAtrule">$1</span>$3');
			
			//"one or more rule sets..."
			html = html.replace(/^([\s]*[⋮][\s]*(?:one[\s]or[\s]more[\s]rule[\s]sets…)[\s]*)$/igm, '<span class="codeDeclarations">$1</span>');
	
			//braces
			html = html.replace(/([\{\}])/igm, '<span class="codeBrace">$1</span>');
	
			break;
	}
	
	//write the resuling html back to the code block
	block.innerHTML = html;
}




//when the page loads,
addEventListener('DOMContentLoaded', function()
{
	//find the visible block 
	var divs = document.getElementsByTagName('div'), 
		hash = location.hash.replace('#', '');
	for(var i=0; i<divs.length; i++)
	{
		if(divs[i].id == hash)
		{
			var block = divs[i].getElementsByTagName('pre').item(0);
		}
	}
	
	//providing we have a visible block
	if(typeof block != 'undefined')
	{
		//add the contentEditable attribute to the code block
		//doing it here rather than having it in static html 
		//saves a lot of filesize and clutter in the example files
		block.setAttribute('contentEditable', 'true');
		
		//bind a click handler to implemet select-all
		//nb. execCommand only works if the element has contentEditable=true
		//which is why we added it, and means the user will also be able to 
		//edit the code examples, which can't be a bad thing in itself
		block.addEventListener('click', function(e)
		{
			//try to select all, which will silently fail in firefox 2,
			//because it doesn't support contentEditable regions
			try { document.execCommand('SelectAll', false, false); } catch(err) {}
	
		}, false);
		
		//add syntax highlighting, wrapping the call in a timeout, just to offset the process
		//not that it's very intense, but overal there is a lot going on
		setTimeout(function() { addSyntaxHighlighting(block); }, 10);
	}
	
	//call the parent codeExampleLoaded method
	//which will size the containing iframe
	//according to the height of the visible code example
	//silently fail this for when someone reads the example page
	//independently of its contianing frame
	try { parent.parent.Firebug.CodeBurner.codeExampleLoaded(document); }
	catch(err) {}

}, false);



