// SPREF1.6 :: CodeBurner for Firebug v1.6
//******************************************************************************
// Copyright (c) 2010 SitePoint Pty Ltd. -- http://www.sitepoint.com/
// Written by brothercake -- http://www.brothercake.com/
//******************************************************************************
// This script defines our panels and registers everything
//******************************************************************************




//everything inside firebug's namespace
FBL.ns(function() { with (FBL) {









//the reference panel goes in the main group
function CodeBurnerReferencePanel() {}
CodeBurnerReferencePanel.prototype = extend(Firebug.Panel,
{
	name: Firebug.CodeBurner.panelnames['reference'],
	title: Firebug.CodeBurner.lang.getString('tab.reference'),
	searchable: true,
	editable: false,
	initialize: function()
	{
		Firebug.Panel.initialize.apply(this, arguments);
		Firebug.CodeBurner.addStyleSheet(this.document, 'reference.css');
	},

	//add "help" to the options menu, which simply
	//resets the search form and outputs the default text
	getOptionsMenuItems: function()
	{
		return [{
			label: Firebug.CodeBurner.lang.getString('optionsmenu.help'),
			nol10n: true,
			command: function()
			{
				var tool = Firebug.CodeBurner;
				tool.clearPanelOutput();
				tool.addDefaultContent(Firebug.currentContext.getPanel(tool.panelnames['reference']));
				tool.setAreaSelections('*');
				tool.searchform.query.value = '';
			}}];
	},

	//we can add the context menu this way because we control this panel
	//the other context listeners we added were to other panels
	//which is why we had to inject into them manually with event listeners
	getContextMenuItems: function(style, target)
	{
		//allow for <u> term delimeter
		if(target.nodeName.toLowerCase() == 'u')
		{
			target = target.parentNode;
		}

		//compile the contextmenu items array for an actionlink
		//nb. firefox 3.5 reads this as "actionlink " (trailing space)
		//hence the indexOf test instead of ==
		if(target.className.indexOf('actionlink') != -1)
		{
			var contextitems =
			[
				{
					label: Firebug.CodeBurner.lang.getString('contextmenu.example'),
					nol10n: true,
					command: function()
					{
						Firebug.CodeBurner.handleActionLink(target.getAttribute('actiondata'));
					}
				},
				'-',
				{
					label: Firebug.CodeBurner.lang.getString('contextmenu.more'),
					nol10n: true,
					command: function()
					{
						var href = target.parentNode.parentNode.nextSibling.nextSibling
							.getElementsByTagName('a').item(0).getAttribute('href');
						if(href) //just for safety
						{
							//nb. had to change the second argument from null to empty object
							//to avoid a "params is null" excepion in firefox 3.6
							//OLD//$('content').addTab(href, {})
							//ff3.6 needs the second argument to be an object
							//but earlier versions need it to be null!
							try { $('content').addTab(href, null); } 
							catch(err) { $('content').addTab(href, {}); } 
						}
					}
				}
			];

			//if we have a live demo for this example, add the live demo item and command
			//making an adjustment to the node value if it's a -moz property
			var actiondata = target.getAttribute('actiondata').replace(/[\"]/g, '').split(',');
			if(actiondata[2] == 'properties' || actiondata[2] == 'selectors')
			{
				var key = actiondata[1];
				if(key.charAt(0) == '-')
				{
					key = key.substr(1, key.length);
				}
				if(typeof Firebug.CodeBurner.liveDemos[key] != 'undefined')
				{
					contextitems.push
					(
						{
							label: Firebug.CodeBurner.lang.getString('contextmenu.livedemo'),
							nol10n: true,
							command: function()
							{
								var href = target.parentNode.parentNode.nextSibling.nextSibling
									.getElementsByTagName('a').item(0).getAttribute('href');
								if(href) //just for safety
								{
									//nb. had to change the second argument from null to empty object
									//to avoid a "params is null" excepion in firefox 3.6
									//OLD//$('content').addTab(href + '/demo', {})
									//we need to cater for the query-tracker, and insert the demo fragment before it
									var sphref = href.replace(
										Firebug.CodeBurner.queryTracker,
										'/demo' + Firebug.CodeBurner.queryTracker
										);
									//ff3.6 needs the second argument to be an object
									//but earlier versions need it to be null!
									try { $('content').addTab(sphref, null); } 
									catch(err) { $('content').addTab(sphref, {}); } 
								}
							}
						}
					);
				}
			}

			//return the items array to populate the menu
			return contextitems;
		}
	},

	//this code comes straight from firebug - lock, stock, and the other thing
	//it makes the search box top right work, to search through search results tables
	search: function(text)
	{
		if (!text)
		{
			delete this.currentSearch;
			return false;
		}

		var row;
		if (this.currentSearch && text == this.currentSearch.text)
		{
			row = this.currentSearch.findNext(true);
		}
		else
		{
			if (this.editing)
			{
				this.currentSearch = new TextSearch(this.stylesheetEditor.box);
				row = this.currentSearch.find(text);

				if (row)
				{
					var sel = this.document.defaultView.getSelection();
					sel.removeAllRanges();
					sel.addRange(this.currentSearch.range);
					scrollSelectionIntoView(this);
					return true;
				}
				else
					return false;
			}
			else
			{
				function findRow(node) { return node.nodeType == 1 ? node : node.parentNode; }
				this.currentSearch = new TextSearch(this.panelNode, findRow);
				row = this.currentSearch.find(text);
			}
		}

		if (row)
		{
			this.document.defaultView.getSelection().selectAllChildren(row);
			scrollIntoCenterView(row, this.panelNode);
			return true;
		}
		else
			return false;
	}
});






//the example-html panel goes in the side deck of the html panel
function CodeBurnerExampleHTMLPanel() {}
CodeBurnerExampleHTMLPanel.prototype = extend(Firebug.Panel,
{
	name: Firebug.CodeBurner.panelnames['example-html'],
	parentPanel: 'html',
	title: Firebug.CodeBurner.lang.getString('tab.example'),
	searchable: false,
	editable: false,
	initialize: function()
	{
		Firebug.Panel.initialize.apply(this, arguments);
		Firebug.CodeBurner.addStyleSheet(this.document, 'example.css');
	}
});


//the example-stylesheet panel goes in the side deck of the stylesheet panel
function CodeBurnerExampleCSSPanel() {}
CodeBurnerExampleCSSPanel.prototype = extend(Firebug.Panel,
{
	name: Firebug.CodeBurner.panelnames['example-stylesheet'],
	parentPanel: 'stylesheet',
	title: Firebug.CodeBurner.lang.getString('tab.example'),
	searchable: false,
	editable: false,
	initialize: function()
	{
		Firebug.Panel.initialize.apply(this, arguments);
		Firebug.CodeBurner.addStyleSheet(this.document, 'example.css');
	}
});


//the example-reference panel goes in the side deck of the reference panel
function CodeBurnerExampleReferencePanel() {}
CodeBurnerExampleReferencePanel.prototype = extend(Firebug.Panel,
{
	name: Firebug.CodeBurner.panelnames['example-reference'],
	parentPanel: Firebug.CodeBurner.panelnames['reference'],
	title: Firebug.CodeBurner.lang.getString('tab.example'),
	searchable: false,
	editable: false,
	initialize: function()
	{
		Firebug.Panel.initialize.apply(this, arguments);
		Firebug.CodeBurner.addStyleSheet(this.document, 'example.css');
	}
});







//register the module and main panel
Firebug.registerModule(Firebug.CodeBurner);
Firebug.registerPanel(CodeBurnerReferencePanel);


//if the firebug version is sufficient, register the example panes too
//[if it isn't you'd never get the chance to open them anyway!]
if(Firebug.CodeBurner.isFirebugVersionOk())
{
	Firebug.registerPanel(CodeBurnerExampleHTMLPanel);
	Firebug.registerPanel(CodeBurnerExampleCSSPanel);
	Firebug.registerPanel(CodeBurnerExampleReferencePanel);
}








//close namespace wrapper
}});

