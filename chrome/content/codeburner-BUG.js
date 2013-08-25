// SPREF1.6 :: CodeBurner for Firebug v1.6
//******************************************************************************
// Copyright (c) 2010 SitePoint Pty Ltd. -- http://www.sitepoint.com/
// Written by brothercake -- http://www.brothercake.com/
//******************************************************************************
// This is our module and everything it does
//******************************************************************************




//everything inside firebug's namespace
FBL.ns(function() { with (FBL) {


	//firebug.codeburner object is the main dude
	Firebug.CodeBurner = extend(Firebug.Module,
	{
		//extension version number
		'version' : '1.6',

		//firebug dependency, which is checked when opening panels
		//and routes to an unsupported/upgrade firebug message if necessary
		'firebug-version' : '1.2',

		//base reference site URL and stats-tracking query
		//eg. links are built from "referenceURL + path + queryTracker"
		//OLDER//'referenceURL' : 'http://reference.sitepoint.com',
		//OLD//'referenceURL' : 'http://tools.sitepoint.com/codeburner/reference/?q=firebug,',
		'referenceURL' : 'http://reference.sitepoint.com',
		'queryTracker' : '?client=codeburner&version=1.6&platform=firebug',

		//load the string bundle that contains our lang data
		'lang' : document.getElementById('spref-langbundle'),

		//the identifying names of our panels
		'panelnames' : {
			'reference' : 'reference',
			'example-html' : 'spref-example-html',
			'example-stylesheet' : 'spref-example-stylesheet',
			'example-reference' : 'spref-example-reference'
			},
	
		//valid serch input characters, as a regexp character class
		'queryinput' : '[-:@\!a-z0-9]',
	
		//search query max length
		'querymax' : '35',

		//starting-boundary characters, as a regexp group
		//we define characters other than actual boundaries so that
		//we can allow things like "size" to match "font-size",
		//and "imp" to match both "@import" and "!important"
		//while otherwise retaining start-substring matching
		'startchars' : '(^|[ -:@\!])',
	
		//browser names
		'browsernames' : {
			'E' : 'Explorer 7',
			'F' : 'Firefox 3.5',
			'S' : 'Safari 4',
			'O' : 'Opera 10',
			'C' : 'Chrome 2'
			},

		//CSS properties and selectors for which there's a live demo online
		//stored as object keys for easy existence checking, ie. (typeof liveDemos[key])
		//where each key refers to an index from the properties or selectors dictionary
		'liveDemos' : {
			'height':'','min-height':'','max-height':'','width':'','min-width':'','max-width':'',
			'margin-top':'','margin-right':'','margin-bottom':'','margin-left':'','margin':'',
			'padding-top':'','padding-right':'','padding-bottom':'','padding-left':'','padding':'',
			'border-top-color':'','border-top-style':'','border-top-width':'','border-top':'',
			'border-right-color':'','border-right-style':'','border-right-width':'','border-right':'',
			'border-bottom-color':'','border-bottom-style':'','border-bottom-width':'',
			'border-bottom':'','border-left-color':'','border-left-style':'','border-left-width':'',
			'border-left':'','border-color':'','border-style':'','border-width':'','border':'',
			'outline-color':'','outline-style':'','outline-width':'','outline':'','display':'',
			'position':'','float':'','clear':'','visibility':'','top':'','right':'','bottom':'',
			'left':'','z-index':'','overflow':'','clip':'','list-style-type':'',
			'list-style-position':'','list-style-image':'','list-style':'','table-layout':'',
			'border-collapse':'','border-spacing':'','empty-cells':'','caption-side':'',
			'background-color':'','background-image':'','background-repeat':'','background-position':'',
			'background-attachment':'','background':'','color':'','font-family':'','font-size':'',
			'font-weight':'','font-style':'','font-variant':'','font':'','letter-spacing':'',
			'word-spacing':'','line-height':'','text-align':'','text-decoration':'','text-indent':'',
			'text-transform':'','text-shadow':'','vertical-align':'','white-space':'','direction':'',
			'unicode-bidi':'','content':'','counter-increment':'','counter-reset':'','quotes':'',
			'cursor':'','moz-border-radius':'','moz-box-sizing':'','zoom':'','filter':'',
			'Universal Selector':'','Element Type Selector':'','Class Selector':'','ID Selector':'',
			'Attribute Selector':'','CSS3 Attribute Selector':'','Descendant Selector':'',
			'Child Selector':'','Adjacent Sibling Selector':'','General Sibling Selector':'',
			':link':'',':visited':'',':active':'',':hover':'',':focus':'',':first-child':'',
			':lang':'',':nth-child':'',':nth-last-child':'',':nth-of-type':'',':nth-last-of-type':'',
			':last-child':'',':first-of-type':'',':last-of-type':'',':only-child':'',':only-of-type':'',
			':root':'',':empty':'',':target':'',':enabled':'',':disabled':'',':checked':'',':not':'',
			':first-letter':'',':first-line':'',':before':'',':after':'','::selection':''
			},



		//initialize the preference service
		'prefservice' : Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces['nsIPrefService'])
			.getBranch('extensions.sitepointreference.'),




		//main output area template [domplate]
		//search results will be written into this area
		'output_code' : domplate({
				'html' :
					DIV({id: 'spref-output', 'class': 'output'}, '')
			}),


		//no results message template [domplate]
		'search_noresults' : domplate({
				'html' :
					P({'class': 'noresults'}, '$object.message')
			}),


		//search results caption template [domplate]
		'searchresults_caption' : domplate({
				'html' :
					H2({'tabindex':'0', 'class': '$object.captionclass', onclick:'$onclick', onkeypress:'$onclick'},
						STRONG({'class':'twisty open'}),
						SPAN('$object.caption ($object.number)')
						),

				//onclick handler is a display toggle for the table beneath
				'onclick' : function(e)
				{
					//only process key events if the keyCode is 13 (enter key)
					//we're doing this because the enter key isn't firing onclick
					if(e.type == 'keypress' && e.keyCode != 13) { return; }

					//get references to the heading, toggle span and table
					var heading = e.target;
					if(/(span|strong)/i.test(heading.nodeName))
					{
						heading = heading.parentNode;
					}
					var twisty = heading.firstChild, table = heading.nextSibling;

					//show or hide the table and change the twisty accordingly
					//nb. once again we have to allow for a trailing space in firefox 3.5
					if(table.className.indexOf('collapsed') == -1)
					{
						table.className = 'collapsed';
						twisty.className = 'twisty closed';
					}
					else
					{
						table.className = 'open';
						twisty.className = 'twisty open';
					}

					//save the new state to preferences
					//nb. we have to remove a trailing space that firefox 3.5 adds
					//otherwise it creates a second preferences called eg. "codeburner.elements " (ffs!)
					var prefname = 'tablestates.' + heading.className.replace(/ special/g, '').replace(/[ ]$/, '');
					Firebug.CodeBurner.prefservice.setCharPref(prefname, table.className);
				}
			}),

		//search results template [domplate]
		'searchresults_code' : domplate({
				'html' :
					TABLE({id: 'spref-resultsfor-$object.term', 'class': '$object.tablestate'},
						TBODY(
							FOR('item', '$object.results',
								TR({'class': '$item.match'},
									TD({'headers': 'spref-result-$item.key-$item.number',
										'class' : 'standard $item.entry.standard', 'rowspan' : '2',
										'title' : '$item.entry.standard_description'},
											IMG({'src':'chrome://sitepointreference/content/images/$item.entry.standard_image',
												'alt' : '$item.entry.standard', 'width':'24', 'height':'24',
												'title' : '$item.entry.standard_description'})
										),
									TH({'id': 'spref-result-$item.key-$item.number', 'class': 'key $item.area', 'rowspan' : '2'},
											A({'tabindex':'0', 'onclick':'$onclick', 'onkeypress':'$onkeypress',
												'actiondata':'$item.actiondata', 'class':'actionlink',
												'title': '$item.actiontitle'}, '$item.key')
										),
									TD({'headers': 'spref-result-$item.key-$item.number',
										'title' : '$item.entry.support.E.title', 'class' : 'browsername'},
											'$item.entry.support.E.browsername'),
									TD({'headers': 'spref-result-$item.key-$item.number',
										'title' : '$item.entry.support.F.title', 'class' : 'browsername'},
											'$item.entry.support.F.browsername'),
									TD({'headers': 'spref-result-$item.key-$item.number',
										'title' : '$item.entry.support.S.title', 'class' : 'browsername'},
											'$item.entry.support.S.browsername'),
									TD({'headers': 'spref-result-$item.key-$item.number',
										'title' : '$item.entry.support.O.title', 'class' : 'browsername'},
											'$item.entry.support.O.browsername'),
									TD({'headers': 'spref-result-$item.key-$item.number',
										'title' : '$item.entry.support.C.title', 'class' : 'browsername'},
											'$item.entry.support.C.browsername')
									),
								TR({'class': '$item.match'},
									TD({'headers': 'spref-result-$item.key-$item.number',
										'title' : '$item.entry.support.E.title',
										'class' : 'supportlevel $item.entry.support.E.supportclass'},
											'$item.entry.support.E.supportlevel'),
									TD({'headers': 'spref-result-$item.key-$item.number',
										'title' : '$item.entry.support.F.title',
										'class' : 'supportlevel $item.entry.support.F.supportclass'},
											'$item.entry.support.F.supportlevel'),
									TD({'headers': 'spref-result-$item.key-$item.number',
										'title' : '$item.entry.support.S.title',
										'class' : 'supportlevel $item.entry.support.S.supportclass'},
											'$item.entry.support.S.supportlevel'),
									TD({'headers': 'spref-result-$item.key-$item.number',
										'title' : '$item.entry.support.O.title',
										'class' : 'supportlevel $item.entry.support.O.supportclass'},
											'$item.entry.support.O.supportlevel'),
									TD({'headers': 'spref-result-$item.key-$item.number',
										'title' : '$item.entry.support.C.title',
										'class' : 'supportlevel $item.entry.support.C.supportclass'},
											'$item.entry.support.C.supportlevel')
									),
								TR(
									TD({'headers': 'spref-result-$item.key-$item.number',
										'colspan': '1', 'class' : 'space'}, ''),
									TD({'headers': 'spref-result-$item.key-$item.number',
										'colspan': '6', 'class' : 'summary'},
											SPAN(
												'$item.entry.summary',
												STRONG({'class' : 'owner'}, '$item.entry.owner')
												),
											//OLD//A({href: '$object.referenceurl'+'$item.entry.path',
											A({href: '$object.referenceurl'+'$item.entry.path'+'$object.querytracker',
												'class':'morelink', title: '$item.title'}, '$item.link')
										)
									)
								)
							)
						),

				//click handler is to open code examples when clicking
				//a node/property name in the search results template
				//we ignore "more" links here, because they're handled separately
				'onclick' : function(e)
				{
					var target = e.originalTarget;
					if(target.nodeName.toLowerCase() == 'u') { target = target.parentNode; } //allow for <u> term delimeter
					//nb. firefox 3.5 reads this as "actionlink " (trailing space)
					//hence the regex test instead of simple equality
					if(target.className && /actionlink/.test(target.className))
					{
						Firebug.CodeBurner.handleActionLink(target.getAttribute('actiondata'));
						e.preventDefault();
					}
				},

				//keypress handler is for pressing enter on an actionlink,
				//because onclick doesn't seem to work
				'onkeypress' : function(e)
				{
					if(e.keyCode == 13)
					{
						Firebug.CodeBurner.handleActionLink(e.target.getAttribute('actiondata'));
						e.preventDefault();
					}
				}
			}),

		//reference search form [domplate]
		//nb. none of the <label> elements use explicit for->id associations, just implicit ones;
		//normally I like to add an explicit association as well, even if there's an implict one,
		//but domplate doesn't seem to like that - on additional tabs it creates a form where
		//you can't click to put focus inside the input field at all!
		'searchform_code' : domplate({
				'html' :
					DIV({id: 'spref-searchbox'},
						FORM({id: 'spref-searchform', action: '', method: 'get', 'class': 'searchform', 'onsubmit': '$onsubmit'},
							FIELDSET({},
								LEGEND(SPAN('$object.legend')),
								LABEL(
									SPAN('$object.query'),
									INPUT({type: 'text', name: 'query', id: 'spref-query', onkeypress: '$oninputkeypress'}, '')
									),
								LABEL(SPAN('$object.area')),
								DIV({'class':'inputgroup', 'id':'checkboxes', 'onclick': '$oncheckboxesclick'},
									LABEL(
										INPUT({type:'checkbox', name: 'elements', id: 'spref-elements', checked:'checked'}),
										SPAN('$object.elements')
										),
									LABEL(
										INPUT({type:'checkbox', name: 'attributes', id: 'spref-attributes', checked:'checked'}),
										SPAN('$object.attributes')
										),
									LABEL(
										INPUT({type:'checkbox', name: 'properties', id: 'spref-properties', checked:'checked'}),
										SPAN('$object.properties')
										),
									LABEL(
										INPUT({type:'checkbox', name: 'selectors', id: 'spref-selectors', checked:'checked'}),
										SPAN('$object.selectors')
										),
									LABEL(
										INPUT({type:'checkbox', name: 'atrules', id: 'spref-atrules', checked:'checked'}),
										SPAN('$object.atrules')
										)
									)
								)
							)
						),

				//keypress handler on the textbox implements autocomplete
				'oninputkeypress' : function(e)
				{

					//get the character of the key that was pressed
					var character = String.fromCharCode(e.charCode);

					//if the character is valid input
					if(new RegExp(Firebug.CodeBurner.queryinput, 'i').test(character))
					{
						//handle these keys and block default action unless a modifier is held down
						//sending the event (from which we can get all the input data)
						//and the area(s) to search from area selections
						if(!(e.ctrlKey || e.metaKey || e.altKey))
						{
							//send event and selected areas to autosearch
							Firebug.CodeBurner.autoSearch(e, Firebug.CodeBurner.getAreaSelections());

							//prevent the default action (handle character insertion manually)
							e.preventDefault();
							return false;
						}
						//otherwise just allow this event to happen
						//(so that you can still do things like cmd+v to paste into the field)
						else
						{
							return true;
						}
					}

					//otherwise, if this event was an actual textual character
					//then prevent its insertion
					else if(e.charCode != 0)
					{
						e.preventDefault();
						return false;
					}

					//otherwise if this is the backspace key
					else if(e.keyCode == 8)
					{
						//save the event object, then
						//wait a moment for the action to have happened
						var event = e, wait = setTimeout(function()
						{
							//as long as the input is not now empty
							if(event.target.value != '')
							{
								//send event and selected areas to autosearch
								Firebug.CodeBurner.autoSearch(e, Firebug.CodeBurner.getAreaSelections());
							}

						}, 50);

						//allow default action
						return true;
					}

					//in any other case it will be an unwanted control character
					//like they enter key, so just allow it
					else
					{
						return true;
					}
				},

				//click handler on the checkboxes div disablesthe text field if no area is seleted
				//and automatically re-searches when appropriate
				'oncheckboxesclick' : function()
				{
					//get the area selections, and a reference to the query textbox
					var selected = Firebug.CodeBurner.getAreaSelections(),
						textbox = Firebug.CodeBurner.searchform.query;

					//if no areas are selected, disable the search query box
					if(selected.length == 0)
					{
						textbox.disabled = true;
					}

					//otherwise one or more items is selected
					else
					{
						//enable the search query box
						textbox.disabled = false;

						//if we have any data in it
						if(textbox.value != '')
						{
							//clear the output area
							Firebug.CodeBurner.clearPanelOutput();

							//re-route the text to search automatically (accepting start substring matches)
							Firebug.CodeBurner.doSearch(selected, textbox.value, 'boundary-start', false, null, true);
						}
					}
				},

				//submit handler on the form passes reference context and search term to search method
				'onsubmit' : function(e)
				{
					//save a shortcut reference
					var tool = Firebug.CodeBurner;

					//save a reference to the query field textbox
					//and validate and enforce maxlength on the field
					//to cater for situations like pasting into it
					var textbox = e.originalTarget.query;
					textbox.value = textbox.value.replace(new RegExp(Firebug.CodeBurner.queryinput, 'i'), '').substr(0, parseInt(tool.querymax, 10));

					//clear the output area
					tool.clearPanelOutput();

					//search the selected dictionary with the search term, accepting start substring matches
					tool.doSearch(tool.getAreaSelections(), textbox.value, 'boundary-start', false, null, true);

					//don't submit the form natively
					e.preventDefault();
				}
			}),

		//template for example pane in the HTML panel [domplate]
		'example_code' : domplate({
				'html' :
					DIV({'id':'spref-example'},
						DIV({'class':'header'},
							H1({'class':'$object.area'}, '$object.node'),
							SPAN({'class':'caption'}, '$object.caption')
							),
						P({'class':'summary'},'$object.summary'),
						DIV({'id':'example'}, ''),
						P({'id':'morelinks'},
							A({'href':'$object.morehref','class':'morelink'}, '$object.moretext')
							)
						)
			}),



		//when the browser starts [extends]
		initialize: function()
		{
			//if the version number dependency is met
			if(this.isFirebugVersionOk())
			{
				//platform-specific stylesheets don't seem to be working in this context
				//probably because firebug already uses them itself
				//so the little bits we're doing are implemented by adding
				//a platform-specific class name to the panel
				this.platform = /mac/i.test(navigator.platform)
					? 'darwin'
					: /win/i.test(navigator.platform)
						? 'winnt'
						: 'linux';

				//support level keys; values used as class names
				this.supportkeys = {
					'?' : 'unknown',
					'X' : 'crash',
					'0' : 'none',
					'1' : 'buggy',
					'2' : 'partial',
					'3' : 'full',
					'plus' : '+'
					};

				//create the support description objects
				this.supportlevels = {};
				this.supporttitles = {};
				for(var i in this.supportkeys)
				{
					if(!this.supportkeys.hasOwnProperty(i)) { continue; }
					this.supportlevels[i] = this.lang.getString('support.' + i);
					this.supporttitles[i] = this.lang.getString('support.title.' + i);
				}

				//try to get DOM utilities, which we'll use to find 
				//selectors applying to an element
				//but it may not be available at all since 
				//it's part of DOM Inspector in some versions
				try
				{
					this.domUtilities = Components.classes["@mozilla.org/inspector/dom-utils;1"]
													.getService(Components.interfaces.inIDOMUtils);
				}
				catch(err) { this.domUtilities = null; }
			}
		},


		isFirebugVersionOk: function()
		{
			return FBL.checkFirebugVersion(Firebug.CodeBurner['firebug-version']) >= 0;
		},




		//load a dictionary script; this is used to avoid having to load the dictionary files until needed
		//or indeed, at all, if they're already present by the user having the firefox version :-)
		loadDictionary: function(area)
		{
			//initialize the subscript loader and [synchronously] load the script into the window scope
			Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
				.getService(Components.interfaces.mozIJSSubScriptLoader)
					.loadSubScript('chrome://sitepointreference/content/dictionaries/' + area + '.js', window);
		},
		
		
	
		//when a main panel is opened [extends]
		showPanel: function(browser, panel)
		{
			//if the version number dependency is met
			if(this.isFirebugVersionOk())
			{
				if (!panel)
					return;
				//if this is the stylesheet or reference panel
				if(panel.name == 'stylesheet' || panel.name == this.panelnames['reference'])
				{
					//save references to the side deck and splitter, if not already created
					if(typeof this.deck == 'undefined')
					{
						this.deck = document.getElementById('fbSidePanelDeck');
						this.splitter = document.getElementById('fbPanelSplitter');

						//bind a dblclick listener to the panel splitter that collapses it
						//but only if this is the stylesheet or reference tab - for any other tab,
						//the other scripting may not be prepared for the possibility of it
						//being hidden; but this isn't an issue for the stylesheet and reference panels
						//because they don't otherwise have the side panel
						this.splitter.addEventListener('dblclick', Firebug.CodeBurner.collapseSidePanelsDeck, false);
					}

					//first check that there's only one panel in the deck, ie. our example panel;
					//if anyone else has added a panel here too, we shouldn't collapse the deck
					//as with other instances, we need relative reference here - we can't start from document
					//because the "document" in this context may not be the document that owns the deck and splitter
					//[FBug1.6B] wrap all this in a function so we can call it more than once
					//[which also means of course that we'll have to qualify the "this" references]
					function precollapse()
					{
						var deck = Firebug.CodeBurner.deck, 
						splitter = Firebug.CodeBurner.splitter,
						paneltabs = deck.getElementsByTagName('panelBar').item(0).getElementsByTagName('panelTab');
						if(paneltabs.length == 1 
							&& paneltabs.item(0).getAttribute('label') == Firebug.CodeBurner.lang.getString('tab.example'))
						{
							//so if it is the only one, and confirming it's the right one, 
							//collapse the side-panel and splitter
							deck.setAttribute('collapsed', 'true');
							splitter.setAttribute('collapsed', 'true');
						}
					}
					
					//** [FBug1.6B] call the pre-collapsing function immediately, then wait 1 millisecond 
					//** and try again; in 1.6B the references we need don't exist immediately, 
					//** but do exist fractionally later; not sure why, and when I have more time I'll 
					//** try to figure it out; so really this should be considered a temporary fix,
					//** but you know how it often is with temporary fixes ... :-O
					precollapse();
					window.setTimeout(function() { precollapse(); }, 1);
					
					//** there are some instances when it should be open, but if we don't collapse it
					//** it just shows up blank; if we do collapse it, the eg is there when manually opened
					//** so this will do for now, until I have more time to investigate why 
					//** any of this is now necessary at all
				}
			}

			//create a global reference to our main reference panel
			//we have to create it every time in order for it to work
			//when multiple instances are open (in different tabs)
			this.panel = Firebug.currentContext.getPanel(this.panelnames['reference']);

			//if this is our reference panel ("Reference" tab)
			if(panel == this.panel)
			{
				//we have to re-attach the stylesheet here every time, for when firebug is being detached
				//(reattachContext() doesn't seem to take care of it on its own,
				// so i've opted not to use that, and do it manually instead)
				this.addStyleSheet(panel.document, 'reference.css');

				//remove any "narrow" class so that the normal layout is default
				//this prevents any initial snap to position when reference tab opens
				panel.panelNode.className = panel.panelNode.className.replace(/ narrow/g, '');

				//if the version number dependency is met
				if(this.isFirebugVersionOk())
				{
					//if our panel has never been opened before,
					//add the framework and default content
					if(!panel.panelNode.innerHTML)
					{
						//add the platform class name
						panel.panelNode.className += ' platform-' + this.platform;

						//add the main output area and save a reference
						this.output = this['output_code'].html.replace({ }, panel.panelNode, this['output_code']);

						//add its default contents
						this.addDefaultContent(panel);

						//compile the lang data for the search form
						lang = {
							'legend' : this.lang.getString('search.legend'),
							'query' : this.lang.getString('search.label.query'),
							'area' : this.lang.getString('search.label.area'),
							'elements' : this.lang.getString('search.option.elements'),
							'attributes' : this.lang.getString('search.option.attributes'),
							'properties' : this.lang.getString('search.option.properties'),
							'selectors' : this.lang.getString('search.option.selectors'),
							'atrules' : this.lang.getString('search.option.atrules')
							};

						//add the search form and save a reference
						//[the form is inside a container that's just a
						//decorative hook hence the change in reference]
						var searchform = this['searchform_code'].html.append({ object:lang }, panel.panelNode, this['searchform_code']);
						this.searchform = searchform.firstChild;

						//bind a resize listener to the surrounding window
						//that will apply the narrow styling to the reference panel contents
						//when the width gets below the threshold (eg when opening the example pane)
						//[in this context, "self" will refer to the window above whatever document currently is]
						self.addEventListener('resize', function()
							{ Firebug.CodeBurner.resizePanel(); }, false);

						//and fire that handler once immediately
						//because there's a few situations where it may not layout correctly otherwise
						//eg when doing a special search from a context menu item
						//which causes this panel to be opened for the first time
						Firebug.CodeBurner.resizePanel();

						//bind a click handler to the panel so we can route links to open in a new tab
						//this handles "more" links in search results,
						//and links in introductory and "no results" message
						//it specifically passes over "action" links, which open the code example pane instead
						panel.panelNode.addEventListener('click', function(e)
						{
							var target = /#text|img/i.test(e.target.nodeName) ? e.target.parentNode : e.target;
							var href = target.getAttribute('href');
							if(href != null && !/actionlink/.test(target.className))
							{
								// xxxFlorent: First prevent the event to trigger the default behaviour
								// so the page won't be open in the panel in any case.
								e.preventDefault();
								// Open the link in a new tab using the Firebug API.
								FBL.openNewTab(href);
							}
						}, false);
						
						//bind the link-hover listeners
						panel.panelNode.addEventListener('mouseover', Firebug.CodeBurner.linkhover, false);
						panel.panelNode.addEventListener('DOMFocusIn', Firebug.CodeBurner.linkhover, false);
					}

					//if we don't have a no auto search parameter
					if(typeof this.noautosearch == 'undefined')
					{
						//get a reference to the html panel
						var htmlpanel = Firebug.currentContext.getPanel('html');

						//if we have a selection in that panel
						//(almost always true, except when our panel is the first to be viewed this session)
						if(typeof htmlpanel.selection != 'undefined' && htmlpanel.selection != null)
						{
							//do a special search
							this.specialSearch(browser, htmlpanel.selection);
						}
					}

					//either way delete the flag for next time
					delete this.noautosearch;

					//wait a moment for the rendering, 
					//then set focus in the search box and fire the resizer
					//without the pause this may happen before rendering has finished
					//in which case they'll just have no effect
					setTimeout(function() 
					{ 
						$('spref-query', panel.document).focus(); 
						Firebug.CodeBurner.resizePanel();
						
					}, 100);
				}

				//otherwise compile the lang for and output the insufficient version message
				else
				{
					//write in the message manually
					//[it's easier to do this without domplate when the content contains inline HTML
					//because that then would require fragmenting the string into separate SPAN and A calls
					//which makes it more difficult to define coherent lang fragments]
					panel.panelNode.innerHTML = '<div id="spref-unsupported">'
						+ '<h1>' + this.lang.getString('default.unsupported.heading') + '</h1>'
						+ '<p>' + this.lang.getString('default.unsupported.intro1')
							.replace('%haveversion', Firebug.version)
							.replace('%needversion', Firebug.CodeBurner['firebug-version'])
						+ '</p>'
						+ '<p>' + this.lang.getString('default.unsupported.intro2') + '</p>'
						+ '</div>';

					//bind a click listener to handle links
					panel.panelNode.addEventListener('click', function(e)
					{
						var href = e.target.getAttribute("href");
						if(href)
						{
							// xxxFlorent: First prevent the event to trigger the default behaviour
							// so the page won't be open in the panel in any case.
							e.preventDefault();
							// Open the link in a new tab using the Firebug API.
							FBL.openNewTab(href);
						}
					}, false);
				}
			}

			//or if it's the HTML panel ("HTML" tab) or the stylesheet panel ("CSS" tab)
			//and if the version number dependency is met
			else if((panel.name == 'html' || panel.name == 'stylesheet')
				&& (this.isFirebugVersionOk()))
			{
				//get a reference to the context menu, if not already defined
				if(typeof this.contextmenu == 'undefined')
					{ this.contextmenu = document.getElementById('fbContextMenu'); }

				//add a mousedown handler to the panel,
				//that automatically populates our example panel, if it's open
				//or saves the data for its next opening, if not
				this.addMouseDownListener(browser, panel);

				//add a context menu listener to the panel
				//which will be used to add item(s) to the menu
				this.addContextmenuListener(browser, panel);

				//for the html panel
				if(panel.name == 'html')
				{
					//add a keyup listener, from which we can get changes in selection
					//that are triggered by keyboard navigation actions
					this.addKeyUpListener(browser, panel);

					//[because the side pane is uncollapsed by default]
					//call the show side panel method for this example panel
					//because that event normally fires first, but in this case
					//we need to engineer it to fire second (and even then after a delay
					//to give the main panel a chance to render) because
					//it needs data that can't be available until this panel is done
					setTimeout(function()
					{
						Firebug.CodeBurner.showSidePanel(browser,
							Firebug.currentContext.getPanel(
								Firebug.CodeBurner.panelnames['example-' + panel.name]));
					}, 100);


					//add special mousedown and contextmenu listeners
					//for the DOM crumbtrail at the top
					this.addCrumbtrailMouseDownListener(browser, document);
					this.addToCrumbtrailContextmenuListener(browser, document);

					//add the event listeners to hook into Inspection
					this.addInspectionListeners(browser, panel, window.content.document);
				}
			}
		},

		//when a side panel is opened [extends]
		showSidePanel: function(browser, panel)
		{
			//if the version number dependency is met
			if(this.isFirebugVersionOk())
			{
				if (!panel)
					return;
				//clear any running code example load timer
				clearInterval(this.egtimer);
				this.egtimer = null;

				//if this is the css panel ("HTML"->"Styles" tab)
				if(panel.name == 'css')
				{
					//get a reference to the context menu, if not already defined
					if(typeof this.contextmenu == 'undefined')
						{ this.contextmenu = document.getElementById('fbContextMenu'); }

					//add a context menu listener to the panel
					//so that we can add new items to its menu
					this.addContextmenuListener(browser, panel);
				}

				//or if this is one of our example panels
				else if(panel.name == this.panelnames['example-html']
					|| panel.name == this.panelnames['example-stylesheet']
					|| panel.name == this.panelnames['example-reference'])
				{
					//[re-] attach the stylesheet
					this.addStyleSheet(panel.document, 'example.css');

					//if we haven't already done so, bind a click handler
					//to the egpanel so we can route the "more" links to open in a new tab
					//we only need one handler in total, because all panels share a document
					if(typeof this.haseghandler == 'undefined')
					{
						panel.document.addEventListener('click', function(e)
						{
							if(e.which != 1) { return true; }
							var target = /#text|img/i.test(e.target.nodeName) ? e.target.parentNode : e.target;
							var href = target.getAttribute('href');
							if(href && target.className && /morelink/.test(target.className))
							{
								// xxxFlorent: First prevent the event to trigger the default behaviour
								// so the page won't be open in the panel in any case.
								e.preventDefault();
								// Open the link in a new tab using the Firebug API.
								FBL.openNewTab(href);
								return false;
							}
							return true;
						}, false);

						//bind the link-hover listeners
						panel.document.addEventListener('mouseover', Firebug.CodeBurner.linkhover, false);
						panel.document.addEventListener('DOMFocusIn', Firebug.CodeBurner.linkhover, false);

						//set the has-handler flag
						this.haseghandler = true;
					}

					//if this is the html example panel
					if(panel.name == this.panelnames['example-html'])
					{
						//get a reference to the master panel
						var htmlpanel = Firebug.currentContext.getPanel('html');

						//if we have selection data saved
						if(typeof htmlpanel.egselectiondata != 'undefined')
						{
							//populate the example panel with that data
							var args = htmlpanel.egselectiondata;
							this.populateExamplePanel(args[0], args[1], args[2], args[3]);
						}

						//otherwise, if we have a selection in the HTML panel
						//(this is just a safety condition, we should always have a selection)
						//in fact this basically never hapopens at all anymore, but it remains
						//as a safety condition just in case an unknown set of circumstances
						//should lead to there being no example selection data
						else if(typeof htmlpanel.selection != 'undefined' && htmlpanel.selection != null)
						{
							//pass the relevant information to populate the example-html panel
							this.populateExamplePanel(
								browser,
								htmlpanel.selection.nodeName.toLowerCase(),
								'elements',
								null
								);
						}
					}

					//or the stylehseet example panel
					else if(panel.name == this.panelnames['example-stylesheet'])
					{
						//get a reference to the master panel
						var csspanel = Firebug.currentContext.getPanel('stylesheet');

						//if we have selection data saved
						if(typeof csspanel.egselectiondata != 'undefined')
						{
							//populate the example panel with that data
							var args = csspanel.egselectiondata;
							this.populateExamplePanel(args[0], args[1], args[2], args[3]);
						}
					}

					//or the reference example panel
					else if(panel.name == this.panelnames['example-reference'])
					{
						//get a reference to the master panel
						var refpanel = Firebug.currentContext.getPanel('reference');

						//if we have selection data saved
						if(typeof refpanel.egselectiondata != 'undefined')
						{
							//populate the example panel with that data
							var args = refpanel.egselectiondata;
							this.populateExamplePanel(args[0], args[1], args[2], args[3]);
						}
					}
				}
			}
		},

		//when firebug is detached [extends]
		reattachContext: function(browser, context)
		{
			//if the version number dependency is met
			if(this.isFirebugVersionOk())
			{
				//get a reference to the external window and its document
				var contextwin = context.chrome.window,
					contextdoc = contextwin.document;
				
				//if we have the window and document references
				if(typeof contextwin != 'undefined' && typeof contextdoc != 'undefined')
				{
					//and to the splitter and deck in that window
					//creating these new references will allow
					//the code in showPanel to collapse them as necessary
					//[wow .. after all that, it was this simple!]
					this.splitter = contextdoc.getElementById('fbPanelSplitter'),
					this.deck = contextdoc.getElementById('fbSidePanelDeck');
	
					//add back the double-click listener
					//to collapse the deck and splitter instances we added
					this.splitter.addEventListener('dblclick', Firebug.CodeBurner.collapseSidePanelsDeck, false);
	
					//add back the resize timer to watch for narrowness
					contextwin.addEventListener('resize', function()
						{ Firebug.CodeBurner.resizePanel(); }, false);
	
					//get a reference to the context menu, and
					//add back the contextmenu listeners to the html and stylesheet
					//panels, passing this document for the popupshowing reference
					//and which is also an override flag to tell it to ignore the have-xxx flags
					//so what we now get is contextmenu listeners in the new window, as well as
					//the ones that are already in the original window
					this.contextmenu = contextdoc.getElementById('fbContextMenu');
					this.addContextmenuListener(browser, context.getPanel('html'), contextdoc);
					this.addContextmenuListener(browser, context.getPanel('stylesheet'), contextdoc);
	
					//add back the crumbtrail listeners
					this.addCrumbtrailMouseDownListener(browser, contextdoc)
					this.addToCrumbtrailContextmenuListener(browser, contextdoc);
	
					//if this is the external detached instance
					//delete the flag that says the egpanel has a click handler
					//so that those handlers get added to the detached window
					//but we musn't do that universally or they'll get
					//added to the attached instance twice
					if(contextwin != window) { delete this.haseghandler; }
	
					//I can't find a method that reports when the detached window is closed, so ...
					contextwin.addEventListener('unload', function()
					{
						//delete the splitter and deck references, forcing the
						//main firebug instance to re-get those references
						//and hence re-attach the dblclick to close event listener
						delete Firebug.CodeBurner.splitter;
						delete Firebug.CodeBurner.deck;
	
						//likewise the context menu reference
						delete Firebug.CodeBurner.contextmenu;
	
					}, false);
	
					//delete the ff2u7hack flag if present,
					//in response to this specific change in context
					delete this.ff2u7hack;
				}
			}
		},

		//when firefox starts / the page changes [extends]
		initContext: function()
		{
			//delete the ff2u7hack flag if present,
			//in response to this specific change in context
			delete this.ff2u7hack;
		},


		//link hover method removes the queryTracker from the URL displayed in the status bar
		linkhover: function(e)
		{
			try
			{
				var target = e.target;
				while(/#text|img/i.test(target.nodeName)) { target = target.parentNode; }
				if(target.href && target.href.indexOf(Firebug.CodeBurner.referenceURL) != -1)
				{
						/* OLD *//*
						document.getElementById('statusbar-display')
							.setAttribute('label', 'http://reference.sitepoint.com' + target.href.split(',')[1]);
						*/
						document.getElementById('statusbar-display')
							.setAttribute(
								'label', 
								//the query-tracker may appear normally, or parsed to append other query data
								target.href.replace(Firebug.CodeBurner.queryTracker, '')
										   .replace(Firebug.CodeBurner.queryTracker.replace('?','&'), '')
								);
				}
			} catch(err){}
		},
	

		//resizer for the main reference panel adds a
		//class name "narrow" if the width drops below threshold
		resizePanel: function()
		{
			var panel = this.panel,
				width = panel.panelNode.offsetWidth;
			if(width < 666)
			{
				panel.panelNode.className += ' narrow';
			}
			else if(/ narrow/.test(panel.panelNode.className))
			{
				panel.panelNode.className = panel.panelNode.className.replace(/ narrow/g, '');
			}
		},

		//collapse the side panels deck
		collapseSidePanelsDeck: function()
		{
			var tool = Firebug.CodeBurner;
			if(Firebug.currentContext.getPanel('stylesheet').visible == true
				|| Firebug.currentContext.getPanel(tool.panelnames['reference']).visible == true)
			{
				tool.splitter.setAttribute('collapsed', 'true');
				tool.deck.setAttribute('collapsed', 'true');
			}
		},

		//clear the output area of our panel
		clearPanelOutput: function()
		{
			//clear the output
			this.output.innerHTML = '';
		},

		//add [back] the default output to our panel
		addDefaultContent: function(panel)
		{
			//write in the default contents
			//[it's easier to do this without domplate when the content contains inline HTML
			//because that then would require fragmenting the string into separate SPAN and A calls
			//which makes it more difficult to define coherent lang fragments]
			this.output.innerHTML = ''
				//default heading has a version number token 
				+ '<h1>' + this.lang.getString('default.heading').replace('%version', this.version) + '</h1>'
				+ '<p class="intro1">' + this.lang.getString('default.intro1') + '</p>'
				+ '<p class="intro2">' + this.lang.getString('default.intro2') + '</p>'
				+ '<p class="copyright">'
					+ this.lang.getString('default.heading').replace('%version', this.version)
					+ ' ~ Copyright \u00A9 ' + (new Date().getFullYear()) 
					+ ' SitePoint Pty Ltd. (cc) Some rights reserved.'
				+ '</p>'
				+ '<div id="spref-reference-links">'
				//OLD//+ '<p class="intro4">' + this.lang.getString('default.intro4').replace('%referenceurl', this.referenceURL) + '</p>'
				+ '<p class="intro4">' + this.lang.getString('default.intro4') + '</p>'
				+ '<ul>'
				//OLD//+ '<li><a href="' + this.referenceURL + '/html">HTML Reference</a></li>'
				//OLD//+ '<li><a href="' + this.referenceURL + '/css">CSS Reference</a></li>'
				//OLD//+ '<li><a href="' + this.referenceURL + '/javascript">JavaScript Reference</a></li>'
				+ '<li><a href="' + this.referenceURL + '/html' + this.queryTracker + '">HTML Reference</a></li>'
				+ '<li><a href="' + this.referenceURL + '/css' + this.queryTracker + '">CSS Reference</a></li>'
				+ '<li><a href="' + this.referenceURL + '/javascript' + this.queryTracker + '">JavaScript Reference</a></li>'
				+ '</ul>'
				+ '</div>'
				+ '<p class="intro3">' + this.lang.getString('default.intro3') + '</p>'
				+ '';

		},

		//work out which of the main panel's we're interested in is currently visible
		//and return references to it and its example panel, otherwise return null
		getVisiblePanel: function()
		{
			//** speculative fix for reported console2 bug
			if(!Firebug.currentContext) { return null; }

			var panelnames = ['html', 'stylesheet', this.panelnames['reference']],
				currentPanel = { 'panel' : null, 'egpanel' : null };
			for(var i=0; i<panelnames.length; i++)
			{
				var panel = Firebug.currentContext.getPanel(panelnames[i]);
				if(panel.visible == true)
				{
					currentPanel.panel = panel;
					currentPanel.egpanel = Firebug.currentContext.getPanel(this.panelnames['example-' + panel.name]);
				}
			}
			return currentPanel;
		},

		//get a reference to a panel from a node inside it
		//from among the panels we add contextmenu items to
		getPanelFromNode: function(node)
		{
			//sometimes Firebug.currentContext returns null, which thence throws an error on line 992 below
			//so check that and return a null panel if so
			//this only appears to happen when firebug isn't being used, 
			//so *I think* it's okay to do this without loss of practical functionality
			if(!Firebug.currentContext) { return null; }
			
			var tool = Firebug.CodeBurner;
			while(!node.className || node.className.indexOf('panelNode') == -1)
			{
				node = node.parentNode;
				if(node == null) { return null; }
			}
			var panelnames = ['html','css','stylesheet'];
			for(var i=0; i<panelnames.length; i++)
			{
				var panel = Firebug.currentContext.getPanel(panelnames[i]);
				if(panel.panelNode == node)
				{
					break;
				}
			}
			return panel;
		},

		//add a stylesheet to our panel
		addStyleSheet: function(doc, stylesheet)
		{
			//-- production code: don't allow the stylesheet to be added more than once --/
			//if($('spref-stylesheet', doc)) { return; }

			//-- dev code: refresh it every time our panel is opened --/
			var sheet = $('spref-stylesheet', doc);
			if(sheet) { sheet.parentNode.removeChild(sheet); }

			//add the stylesheet
			var styleSheet = createStyleSheet(doc, "chrome://sitepointreference/content/" + stylesheet);
			styleSheet.setAttribute("id", "spref-stylesheet");
			addStyleSheet(doc, styleSheet);
		},


		//get selections from the search area checkboxes
		getAreaSelections: function()
		{
			var selected = [], 
				checkboxes = this.panel.document.getElementById('checkboxes').getElementsByTagName('input');
			for(var i=0; i<checkboxes.length; i++)
			{
				if(checkboxes[i].checked)
				{
					selected.push(checkboxes[i].name);
				}
			}
			return selected;
		},

		//set one or more selections on the search area checkboxes
		//argument can be "foo" or "foo,bar" or "*"
		//this affects all checkboxes, unchecking any which are not specified
		//so setAreaSelections('') will uncheck them all
		setAreaSelections: function(names)
		{
			//split names to get values, and trim whitespace
			names = names.split(',');
			for(var i=0; i<names.length; i++)
			{
				names[i] = this.trim(names[i]);
			}
			
			//get and iterate through the checkboxes collection
			//remembering how many we checked along the way
			var howmany = 0, 
				checkboxes = this.panel.document.getElementById('checkboxes').getElementsByTagName('input');
			for(var j=0; j<checkboxes.length; j++)
			{
				//whether to check this checkbox
				var check = false;
				
				//iterate through the names, and if this checkbox name is in the array
				//or the name value is "*" (all checkboxes), increase howmany, set check to true and break
				for(i=0; i<names.length; i++)
				{
					if(names[i] == '*' || names[i] == checkboxes[j].name)
					{
						howmany ++;
						check = true;
						break;
					}
				}
				
				//check or uncheck this checkbox accordingly
				checkboxes[j].checked = check;
			}
			
			//disable the search field if none are checked, otherwise enable it
			this.searchform.query.disabled = (howmany == 0);
		},



		//clean a menu, removing any of our items
		//this is a last resort - as much as possible, we prevent the
		//addition of duplicate items at source; but there's so much
		//changing of context and environment, it does my head in
		//and I haven't been completely successful at preventing them all
		//so this acts as a final filter after all else is done
		removeMenuItems: function(menu)
		{
			var tags = ['menuseparator', 'menuitem'];
			for(var i=0; i<tags.length; i++)
			{
				var items = menu.getElementsByTagName(tags[i]);
				for(var j=0; j<items.length; j++)
				{
					if(items[j].getAttribute('class') == 'spref-menuitem')
					{
						//[FBug1.6] ***DEV EXCEPTION HANDLER
						try {
							
							
						items[j].parentNode.removeChild(items[j]);
						j--;


						//[FBug1.6] ***DEV EXCEPTION HANDLER
						}catch(err){alert('Error from removeMenuItems:\n-------------------------\n'+err.message);}
					}
				}
			}
		},



		//add a separator to a menu
		//including an identifying class so we can later clean it
		addMenuSeparator: function(menu, doc)
		{
			if(typeof doc == 'undefined') { var doc = document; }
			var item = menu.appendChild(doc.createElement('menuseparator'));
			item.setAttribute('class', 'spref-menuitem');
		},

		//add an item + command to a menu, including an identifying class 
		addMenuItem: function(menu, value, command, doc)
		{
			if(typeof doc == 'undefined') { var doc = document; }

			var item = doc.createElement('menuitem');
			item.setAttribute('label', value);
			item.setAttribute('class', 'spref-menuitem');
			menu.appendChild(item);

			item.addEventListener('command', command, false);
		},


		// xxxFlorent: window.getComputedStyle(elt, [pseudoelt])? https://developer.mozilla.org/en-US/docs/Web/API/window.getComputedStyle
		//get style information for an element,
		//so that we can do property and selector autosearches
		getStyleInformation: function(browser, element)
		{
			//oh man ... oh man ... you would not believe how much source-poking
			//and fragging about it took me to work out how to do this!

			//first we have to create a new tab context, so we have access to the getPanelType method...
			//[we can't just use an existing context reference, that doesn't give us method access]
			var context = new Firebug.TabContext(window, browser, Firebug.chrome, false);

			//so that we can get a reference to the CSSElementPanel object...
			var paneltype = Firebug.getPanelType('css');

			//which we pass to getPanelByType so we can access the css panel's methods...
			var csspanel = context.getPanelByType(paneltype); 

			//so that we can do this intrigueing business to get the style information for this element
			//what we get back is a complex array of objects containing all the data we could want :)
			//data from disabled stylesheets is not included, so we don't need to do that filtering ourselves
			var rules = [], sections = [], usedprops = {};
			csspanel.getInheritedRules(element, sections, usedprops);
			csspanel.getElementRules(element, rules, usedprops);

			//all of which I had to work out the hard way ... by looking for likely-sounding methods
			//and then following execution chains back far enough to work out how to access them!
			//though having done so, i have to say, it's amazing what data firebug can extract :-O
			//once I had this data I did some recursive dumps
			//to see what it contains, and how to access the info we want

			//create the properties we're going to return
			var properties = [];

			//create the array of the CSS properties that apply to this element
			//these are conveniently available as the indexes of the usedprops array
			for(var i in usedprops)
			{
				if(!usedprops.hasOwnProperty(i)) { continue; }
				properties.push(i);
			}

			//get the style attribute
			var attrval = element.getAttribute('style');
			
			//if we have one
			if(attrval) 
			{
				//split the attribute value to get the individual property definitions
				var attrprops = attrval.split(';');
		
				//iterate through the values
				for(var i=0; i<attrprops.length; i++)
				{
					//split to to get the property name
					var styleprop = this.trim(attrprops[i].split(':')[0]);	
					
					//if the result is empty, continue to the next iteration
					if(styleprop == '') { continue; }
		
					//if the property is not already included, add it to the array
					if(!this.arrayContains(properties, styleprop))
					{
						properties.push(styleprop);
					}
				}
			}		
	
			//return the properties array
			return properties;
		},



		//get selectors information for an element
		//** this is probably quite inefficient - much of this data is probably
		//** already present in the data we got from firebug in getStyleInformation
		getSelectorsInformation: function(element)
		{
			//if we don't have dom utilities, return an empty array
			if(!this.domUtilities) { return []; }
			
			//save a reference to the CSSStyleRule interface
			var nsIDOMCSSStyleRule = Components.interfaces['nsIDOMCSSStyleRule'];
			
			//we'll need a regex for identifying all pseudo-classes except not
			var regexPCEN = /([:](?:(link|visited|active|hover|focus|lang|root|empty|target|enabled|disabled|checked|default|valid|invalid|required|optional)|((in|out\-of)\-range)|(read\-(only|write))|(first|last|only|nth)(\-last)?\-(child|of\-type))(?:\([_a-z0-9\-\+\.\\]*\))?)/ig;
			
			//create an empty array of selector types to return
			var selectortypes = [];
			
			//get the style rules applying to this element
			var rules = this.domUtilities.getCSSStyleRules(element);
			if(rules)
			{
				//iterate through them
				for(var i=0; i<rules.Count(); ++i)
				{
					//wrap this whole thing in exception handling
					//in case the element fails to return a cssRule
					//or the rule has an invalid selector
					try
					{
						
						//get the individual rule, then pass it to the 
						//CSSStyleRule interface to get a cssRule object in return;
						//then get a reference to its parent stylsheet
						var cssrule = rules.GetElementAt(i).QueryInterface(nsIDOMCSSStyleRule),
							stylesheet = cssrule.parentStyleSheet;
						
						//ignore this stylesheet and continue if it's disabled, 
						//or if it doesn't have an http, file or data href href (if it has any href at all)
						//this excludes system stylesheets [with a "resource://" protocol]
						//but allows <style> element stylesheets which have a null href
						//[might not actually be necessary, but doesn't do any harm if it's not!]
						if(stylesheet.disabled || (stylesheet.href != null && !/^(http|file|data)/i.test(stylesheet.href))) { continue; }
						
						//now we need to process the selector text, because what we get back
						//is a list of every complete selector that contains a selector to this element
						//so if the element was #foo, then the selector "#foo, #bar, .whatever" includes it
						//and passing that to the extract method will return "id selector" AND "class selector"
						//when in fact only the id selector actually applies to the element
						//so what we do to process the selector is retain only those that actually apply
						//nb. we have to remove any pseudo-classes before those states would otherwise always return false
						//but remember to add the /unedited/ selector to the selectors array!
						var selectors = [], selectorText = cssrule.selectorText.split(',');
						for(var j=0; j<selectorText.length; j++)
						{
							var editedSelectorText = selectorText[j].replace(regexPCEN, '');
							var nodes = element.ownerDocument.querySelectorAll(editedSelectorText);
							for(var k=0; k<nodes.length; k++)
							{
								if(nodes[k] == element)
								{
									if(!this.arrayContains(selectors, selectorText[j]))
									{
										selectors.push(selectorText[j]);
									}
									break;
								}
							}
						}
						
						//extract the selector types from the final selector text
						var items = this.extractSelectorTypes(selectors.join(','));
						
						//then extract the pseudo-nodes and add them to the array
						items = this.extractPseudoNodes(selectors.join(','), items);
			
						//iterate through the items array, 
						//and add each one to the selectortypes array
						//providing that it's not already listed
						for(var j=0; j<items.length; j++)
						{
							if(!this.arrayContains(selectortypes, items[j]))
							{
								selectortypes.push(items[j]);
							}
						}
						
					}
					//just move on if we fail
					catch(err) { }
				}
			}
			
			//if the selectors array is not empty, sort it alphabetically
			if(selectortypes.length > 0) { selectortypes.sort(); }
			
			//return the final array
			return selectortypes;
		},
	
		
		//get the at-rules information for an element
		getAtRulesInformation: function(element)
		{
			//if we don't have dom utilities, return an empty array
			if(!this.domUtilities) { return []; }
			
			//save a reference to the CSSStyleRule interface,
			var nsIDOMCSSStyleRule = Components.interfaces['nsIDOMCSSStyleRule'];
			
			//we'll need a regex for identifying media queries 
			//in a rule or stylesheet's mediaText
			var hasMediaQuery = /([ \t]and\s*\([^\)]+\))/i;
	
			//create an empty array of at-rule types to return
			//and make a local shortcut function for adding uniquely to the array
			//[the other get functions didn't really need this, because they didn't have to
			// check through possibilities in quite such a laboriously manual fashion!]
			var atruletypes = [], 
			add = function(artype)
			{
				if(!Firebug.CodeBurner.arrayContains(atruletypes, artype))
				{ 
					atruletypes.push(artype); 
				}
			};
			
			//get the style rules applying to this element
			var rules = this.domUtilities.getCSSStyleRules(element);
			if(rules)
			{
				//iterate through them
				for(var i=0; i<rules.Count(); ++i)
				{
					//get the individual rule, then pass it to the 
					//CSSStyleRule interface to get a cssRule object in return;
					//then get a reference to its parent stylsheet
					var cssrule = rules.GetElementAt(i).QueryInterface(nsIDOMCSSStyleRule),
						stylesheet = cssrule.parentStyleSheet;
					
					//ignore this stylesheet and continue if it's disabled, 
					//or if it doesn't have an http, file or data href (if it has any href at all)
					//this excludes system stylesheets [with a "resource:" protocol]
					//but allows <style> element stylesheets which have a null href
					//[might not actually be necessary, but doesn't do any harm if it's not!]
					if(stylesheet.disabled || (stylesheet.href != null && !/^(http|file|data)/i.test(stylesheet.href))) { continue; }
	
					//if the rule has a parent rule, and it's an at-media rule,
					//[though there's nothing else it coud be!]
					//add "@media" to our array, if not already listed
					if(cssrule.parentRule != null && cssrule.parentRule.type == cssrule.MEDIA_RULE)
					{
						add('@media'); 
						
						//and if its mediaText contains the pattern of a media query
						//and "Media Query" to our array, if not already listed
						//[there doesn't seem to be any other property of the rule
						// that's unique to media queries, so how else to identify them?]
						if(hasMediaQuery.test(cssrule.parentRule.media.mediaText))
						{
							add('Media Query'); 
						}
					}
					
					//a media query might also be part of the media attribute of a link or xml-stylesheet,
					//or even as part of a media-specific import statement,
					//so check if the parent stylesheet has non-null href and media properties, 
					//and if so look for a media query there, and if we find one
					//and "Media Query" to our array, if not already listed
					//[but not "@media" -- it's not an at-media statement just because it's a media query!]
					if(stylesheet.href != null && stylesheet.media != null)
					{
						if(hasMediaQuery.test(stylesheet.media.mediaText))
						{
							add('Media Query'); 
						}
					}
					
					//if the stylesheet has an owner rule, and it's an at-import rule,
					//[is there anything else it could be, being an owner rule?]
					//add "@import" to our array, if not already listed
					if(stylesheet.ownerRule != null && stylesheet.ownerRule.type == cssrule.IMPORT_RULE)
					{
						add('@import'); 
					}
					
					//now we have to run through the stylesheet's rules collection
					//to look for at-charset, at-font-face, at-namespace or at-page rules;
					//firefox 3.6 [at the time of writing] doesn't support at-page rules, 
					//but we'll allow for them anyway for forward compatibility;
					//it does partially-implement at-namespace rules, but they show-up
					//in the rules collection as type 0 / UNKNOWN_RULE; but we'll  
					//check for them in the right place as well, for forward compatibility
					var sheetrules = stylesheet.cssRules;
					for(var n=0; n<sheetrules.length; n++)
					{
						//save the rule then switch by type
						var sheetrule = sheetrules.item(n);
						switch(sheetrule.type)
						{
							//if we find a charset rule, it applies to the whole stylesheet
							//so add it straight to our array, if not already listed
							case sheetrule.CHARSET_RULE : 
								add('@charset');
								break;
								
							//if we find a page rule, it also applies to the whole stylesheet
							//so add it straight to our array, if not already listed
							case sheetrule.PAGE_RULE : 
								add('@page');
								break;
								
							//if we find an unknown or namespace rule
							//[testing its syntax so we can combine both conditions into one]
							case sheetrule.UNKNOWN_RULE :
							case sheetrule.NAMESPACE_RULE :
	
								//don't bother if @namespace is already listed in our array
								//we'll just be doing expensive work for no reason
								if(!this.arrayContains(atruletypes, '@namespace')) 
								{
									//firefox 3.6 [at the time of writing] doesn't identify the namespace prefix
									//in the rule's selectorText, even though it clearly does understand, 
									//since it applies the rule or not according to whether its namespace prefix
									//matches the element's namespace -- therefore the cssrule won't show up here 
									//at all if it doesn't -- so we'll match at-namespace as applying 
									//if the namespace rule is for the default namespace
									//or its namespace URI matches the element's namespace URI 
									//[if it has one ... which interestingly it seems, all elements do, 
									//not just elements on XHTML pages! so we can combine
									//both those checks with a single namespaceURI comparision]
									//what this ultimately means is that any @namespace rule 
									//for the default or any-prefix-named HTML namespace, in a stylesheet
									//which contains other rules that apply to the tested element, 
									//on an HTML page, will always be listed in a special search for that element;
									if(matches = /@namespace\s+.*url\([\'\"]?([^\)\'\"]+)[\'\"]?\)/im.exec(sheetrule.cssText))
									{
										if(element.namespaceURI == matches[1]) 
										{ 
											add('@namespace'); 
										}
									}
								}
								break;
								
							//if we find a font-face rule we have to check that
							//the font it describes actually applies to the element
							case sheetrule.FONT_FACE_RULE : 
							
								//don't bother if @font-face is already listed in our array
								//we'll just be doing expensive work for no reason
								if(!this.arrayContains(atruletypes, '@font-face')) 
								{
									//firefox throws an error if we try to enumerate sheetrule.style
									//so we're just going to have to parse the cssText manually
									//and extract the font-family from that to compare [case-insensitively] 
									//against the font-family from the element's computed style [ditto]
									//if we find a match, add @font-face to our array, if not already listed
									if(matches = /font\-family\s*\:\s*(?:[\'\"]?)([^\'\"\;]+)(?:[\'\"]?\;)/im.exec(sheetrule.cssText))
									{
										var docview = element.ownerDocument.defaultView;
										if(docview && docview.getComputedStyle(element, '')
													  .getPropertyValue('font-family').toLowerCase()
													  .indexOf(matches[1].toLowerCase()) >= 0)
										{
											add('@font-face'); 
										}
									}
								}
								break;
						}
					}
				}
			}
	
			//if the atruletypes array is not empty, sort it alphabetically
			if(atruletypes.length > 0) { atruletypes.sort(); }
			
			//return the final array
			return atruletypes;
		},		
		
	
		//extract one or more types of selector from a selector
		//for example "div .something+[foo]" contains an element selector,
		//descendent selector, adjacent sibling selector and an attribute selector
		extractSelectorTypes: function(selector)
		{
			//define a selectortypes array
			var selectortypes = [];
			
			//with many of these selector what we have to watch out for
			//is what look like selectors that are actually string values in attribute selectors
			//for example, an attribute selector like: div[id="foo.bar"] which is not a class selector
			//and there are some cases of what looks like one selector being part of another
			//namely, the substring-matching attribute selector [attr*=val] 
			//that contains the "*" character which is the universal selector
			//and the linear equation in some pseudo-classes, like :nth-child(n+1)
			//that contains the "+" character which is the adjacent sibling selector
			//and one form of the attribute selector [attr~=val]
			//that contains the "~" character which is the general sibling selector
			//so what we're going to do to prevent this is remove all values from attribute selectors first
			//before attempting to identify any other selectors; this won't affect our ability to 
			//detect the attribute selectors, because we'll still have the attribute name [, match symbol and quote marks]
			//and for the more complex caveats we'll have to check for the affected selector first
			//then parse-out the selector that's causing the conflict, then check for the affected selector again
			//eg. if we test Ò.classname div[id="foo.bar"]Ó for a .class selector we won't find one
			//because our conditions will exclude it because of the attribute selector with a dot in it
			//so we'll test for and identify the attribute selector, then remove it,
			//then check it again for a .class selector, and that's when we'll find it :-)
			
			//a useful thing to know here is that firefox normalizes attribute selectors:
			//		* their values are always double-quoted, whether the original is double, single or not quoted at all
			//other normalizing of selector syntax that firefox does (which affects us):
			//		* normalizes the space (or lack of it) either side of child, adjacent sibling 
			//			and general sibling selectors to exactly one space
			//		* converts "odd" and "even" keywords in nth-child pseudo-classes to linear equations
			//		* removes the "*" preceding a universal+attribute selector such as *[lang="en"]
			//		* normalizes double-colon syntax in pseudo-elements to a single-colon
			//		* normalizes excessive space in a descendent selector to a single space
			//		* converts :not() [with an empty bracket] to :not(*) [with a universal selector]
			//		* adds a space after the "!" character in an !important declaration
			
			//firefox does a whole lot of normalizing CSS, and although some of it is quite helpful 
			//like some of selector syntax normalizing it's doing here, which makes them easier to detect
			//and the quotes around generated content, which are always normalized to double-quotes
			//some other things it does are quite annoying, like the way it normalizes hex values to RGB, 
			//which means that you can't get the original hex value of a property from getComputedStyle
			//but none of that affects us here, I just though I'd mention it since we're on the subject!
			
			//anyway...
			
			//remove values from between quote marks in attribute/substring-matching attribute selectors
			selector = selector.replace(/(\[[_a-z0-9-:\.\|\\]+[~\|\*\^\$]?=\")(?:[^\"]*)(\"\])/ig, '$1$2');
	
			//universal selector; has to explicitly reject the [attr*="val"] selector
			//this will fail if a selector contains a universal selector AND a substring-matching attribute selector, 
			//so we'll check again when we test for substring-matching attribute selectors
			var universal_selector = /\*/i;
			if(universal_selector.test(selector) 
					&& !/\[([_a-z0-9-:\.\\]+)\*=\"\"/i.test(selector)) 
				{ selectortypes.push('Universal Selector'); }
				
			//element type selector; has to check for valid characters, and that 
			//it's not a class, ID, or attribute selector, or a pseudo-class
			//which is most simply done as an inverse condition - that it's preceded by 
			//nothing, or a child, sibling or descendent selector, a :not() pseudo-class,
			//or the vertical bar in a namespaced element selector
			//but since it may be inside the brackets of a :not condition, we have to make sure
			//that it's not the language code inside a :lang pseudo-class, 
			//such as :lang(fr), which would otherwise be identified as an <fr> element
			//so we'll do that by explicitly checking that if it's preceded by a bracket
			//then that bracket is part of a :not condition
			//the other complication here is that XML element names are allowed to contain colons
			//so we have to do a pattern check to make sure they're not pseudo-classes
			//element names are also allowed to contain dots, but such a selector would be 
			//intepreted as a class selector, so we needn't check for that 
			//(which is as well, because we can't tell the difference; and neither it seems can anyone else!)
			if(/(^|[\|\+>~ ]|(:not\())([_a-z0-9-\\]+)(:[_a-z0-9-\\]+)?/i.test(selector)) 
				{ selectortypes.push('Element Type Selector'); }
			
			//class selector; has to check for valid characters and a valid pattern
			//and that it's not part of the attribute name in an attribute selector
			//nb. this will fail if a selector contains a class selector AND an attribute selector 
			//that has a dot in its name, so we'll check again when we test for attribute selectors
			var class_selector = /(\.[_a-z]+[_a-z0-9-]*)/i;
			if(class_selector.test(selector) 
					&& !/\[([_a-z0-9-:\\]*)([\.]+)([_a-z0-9-:\\]*)([~\|\*\^\$])?(=\"\")?\]/i.test(selector)) 
				{ selectortypes.push('Class Selector'); }
			
			//ID selector; has to check for valid characters and a valid pattern
			//although "." is allowed in an ID value, we'll never be able to test it with an ID selector
			//because it will just be interpreted as an ID.class selector
			if(/(#[a-z]+[_a-z0-9-:\\]*)/i.test(selector)) 
				{ selectortypes.push('ID Selector'); }
			
			//attribute selector; has to check for valid characters in attribute names 
			//theoretically we could say that an attribute selector on its own 
			//also contains a universal selector; but I decided not to - it would just confuse people
			var attr_selector = /\[([_a-z0-9-:\.\|\\]+)([~\|])?(=\"\")?\]/ig;//we need greedy for when we do replace() with it
			if(attr_selector.test(selector))
			{ 
				selectortypes.push('Attribute Selector'); 
			
				//now remove the attribute selector and check again for a .class selector
				//to fix the issue with class selector detection (noted above)
				var parsedselector = this.trim(selector.replace(attr_selector, ''));
				
				//but check arrrayContains to avoid duplication
				if(class_selector.test(parsedselector) 
						&& !this.arrayContains(selectortypes, 'Class Selector'))
					{ selectortypes.push('Class Selector'); }
			}
				
			//substring-matching attribute selector; similar to attribute selector except the value is not optional
			//theoretically we could say that an attribute selector on its own 
			//also contains a universal selector; but I decided not to - it would just confuse people
			var substring_attr_selector = /\[([_a-z0-9-:\.\|\\]+)([\*\^\$])=\"\"\]/ig;//we need greedy for when we do replace() with it
			if(substring_attr_selector.test(selector))
			{ 
				selectortypes.push('CSS3 Attribute Selector'); 
			
				//now remove the attribute selector and check again for a .class selector
				//to fix the issue with class selector detection (noted above)
				//and also check again for a universal selector, to fix the issue there (noted above)
				parsedselector = this.trim(selector.replace(substring_attr_selector, ''));
				
				//but check arrrayContains to avoid duplication
				if(class_selector.test(parsedselector) 
						&& !this.arrayContains(selectortypes, 'Class Selector'))
					{ selectortypes.push('Class Selector'); }
				
				if(universal_selector.test(parsedselector) 
						&& !this.arrayContains(selectortypes, 'Universal Selector'))
					{ selectortypes.push('Universal Selector'); }
			}
				
			//descendent selector; has to check it has an element, ID, class, universal, 
			//or attribute selector, or a pseudo-node, either side
			if(/([_a-z0-9-\]\*\)\\])([\s]*)([ ])([\s]*)([_a-z0-9-\[\*\.#:\\])/i.test(selector))
				{ selectortypes.push('Descendant Selector'); }
				
			//child selector; same as descendent selector
			if(/([_a-z0-9-\]\*\)\\])([\s]*)(>)([\s]*)([_a-z0-9-\[\*\.#:\\])/i.test(selector))
				{ selectortypes.push('Child Selector'); }
				
			//adjacent sibling selector; same as descendent selector
			//but additionally has to check that it's not part of the linear equation in a pseudo-class
			//this will fail if a selector contains a linear equation AND an adjacent sibling selector
			//so we're going to check again immediately after we've done this 
			//ordinarily we would do that after detecting the pseudo-class, but they're in a different method
			var adjacent_sibling_selector = /([_a-z0-9-\]\*\)\\])([\s]*)(\+)([\s]*)([_a-z0-9-\[\*\.#:\\])/i;
			if(adjacent_sibling_selector.test(selector) 
					&& !/\(([1-9n\-\+]+)\+([1-9]+)\)/i.test(selector))
				{ selectortypes.push('Adjacent Sibling Selector'); }
	
			//so what we have to do is remove any pseudo-class that may contain a linear equation, 
			//and then check again for an adjacent sibling selector
			var linear_equation_pseudo_class = /:nth(((\-last)?\-child)|((\-last)?\-of\-type))\(([^\)]+)\)/ig;
			if(linear_equation_pseudo_class.test(selector))
			{
				parsedselector = this.trim(selector.replace(linear_equation_pseudo_class, ''));
				
				//but check arrrayContains to avoid duplication
				if(adjacent_sibling_selector.test(parsedselector) 
						&& !this.arrayContains(selectortypes, 'Adjacent Sibling Selector'))
					{ selectortypes.push('Adjacent Sibling Selector'); }
			}
				
			//general sibling selector; same as descendent selector
			//we don't have any confusion with the [attr~=val] selector
			//because we're checking for selectors on either side of it
			//and the general sibling selector can't be followed by "="
			if(/([_a-z0-9-\]\*\)\\])([\s]*)(~)([\s]*)([_a-z0-9-\[\*\.#:\\])/i.test(selector))
				{ selectortypes.push('General Sibling Selector'); }
			
			//return the selectortypes array
			return selectortypes;
		},
	
		//extract one or more types of pseudo-class or pseudo-element from a selector
		extractPseudoNodes: function(selector, selectortypes)
		{
			//we don't define a selectortypes array here - we have at as input
			//so that whatever we find here is added to the existing array of selectortypes
			
			//pseudo-classes that don't contain brackets may actually be part of an attribute name
			//and not a pseudo-class at all, the most obvious example of which is Ò[xml:lang]Ó
			//(colons are allowed in attribute names, but brackets aren't)
			//we won't consider element names with colons in, because there's no way to distinguish them 
			//from an element with a pseudo-class, but we do have to consider attribute names
			//so what we'll do is just delete any attribute selectors from the input selector at the start
			//and that way we'll avoid any possible conflict with the names
			//happily, since none of these are perfect substrings of any other, there's no complication there :-)
			
			//remove attribute selectors
			selector = selector.replace(/\[[_a-z0-9-:\.]+([~\|\*\^\$]?=\"[^\"]*\")?\]/ig, '');
			
			//pseudo-classes
			//we're not going to check for valid syntax of the bracketed ones - we'll leave that to firefox! 
			//but we will at least check that they contain brackets 
			//although we will have to allow for those brackets being empty, because of our removing 
			//attribute selectors - you might have something like Òtd:not([colspan])Ó
			//which means we can't identify selectors that actually had empty brackets to begin with
			//which in some cases is invalid, but again, that's not our concern
			//theoretically we could say that a pseudo-class on its own 
			//also contains a universal selector; but I decided not to - it would just confuse people
			if(/:link/i.test(selector)) { selectortypes.push(':link'); }
			if(/:visited/i.test(selector)) { selectortypes.push(':visited'); }
			if(/:active/i.test(selector)) { selectortypes.push(':active'); }
			if(/:hover/i.test(selector)) { selectortypes.push(':hover'); }
			if(/:focus/i.test(selector)) { selectortypes.push(':focus'); }
			if(/:first\-child/i.test(selector)) { selectortypes.push(':first-child'); }
			if(/:lang\(([^\)]*)\)/i.test(selector)) { selectortypes.push(':lang'); }
			if(/:nth\-child\(([^\)]*)\)/i.test(selector)) { selectortypes.push(':nth-child'); }
			if(/:nth\-last\-child\(([^\)]*)\)/i.test(selector)) { selectortypes.push(':nth-last-child'); }
			if(/:nth\-of\-type\(([^\)]*)\)/i.test(selector)) { selectortypes.push(':nth-of-type'); }
			if(/:nth\-last\-of\-type\(([^\)]*)\)/i.test(selector)) { selectortypes.push(':nth-last-of-type'); }
			if(/:last\-child/i.test(selector)) { selectortypes.push(':last-child'); }
			if(/:first\-of\-type/i.test(selector)) { selectortypes.push(':first-of-type'); }
			if(/:last\-of\-type/i.test(selector)) { selectortypes.push(':last-of-type'); }
			if(/:only\-child/i.test(selector)) { selectortypes.push(':only-child'); }
			if(/:only\-of\-type/i.test(selector)) { selectortypes.push(':only-of-type'); }
			if(/:root/i.test(selector)) { selectortypes.push(':root'); }
			if(/:empty/i.test(selector)) { selectortypes.push(':empty'); }
			if(/:target/i.test(selector)) { selectortypes.push(':target'); }
			if(/:enabled/i.test(selector)) { selectortypes.push(':enabled'); }
			if(/:disabled/i.test(selector)) { selectortypes.push(':disabled'); }
			if(/:checked/i.test(selector)) { selectortypes.push(':checked'); }
			if(/:not\(([^\)]*)\)/i.test(selector)) { selectortypes.push(':not'); }
			
			//psuedo-elements
			//we don't have to allow for single or double-colon syntax, 
			//because firefox normalizes them all to single colons
			//theoretically we could say that a pseudo-element on its own 
			//also contains a universal selector; but I decided not to - it would just confuse people
			if(/:first\-letter/i.test(selector)) { selectortypes.push(':first-letter'); }
			if(/:first\-line/i.test(selector)) { selectortypes.push(':first-line'); }
			if(/:before/i.test(selector)) { selectortypes.push(':before'); }
			if(/:after/i.test(selector)){ selectortypes.push(':after'); }
			//nb. firefox doesn't support ::selection, so it won't actually ever appear
			//but we'll include it anyway for forward-compatibility
			//and since we don't know whether its future implementation will normalize the colons
			//we'd better allow for double-colon syntax as well, just in case it doesn't
			if(/([:]{1,2})selection/i.test(selector)) { selectortypes.push('::selection'); }
	
			//return the selectortypes array
			return selectortypes;
		},



		//add the event listeners to hook into Inspection
		addInspectionListeners: function(browser, panel, contentdoc)
		{
			//we detect the change in inspection target by hooking into this DOM 2 method
			//which detects changes in attribute values within the "html" panel
			//from this we know when a node box is highlighted, indicating that it's an
			//inspection target, and from that we can extract a node name for code examples
			//perhaps this seems unecessarily comvoluted; but the more obvious use of mousedown/up/click
			//proved awkward given the transient state of the box highlight, and of course it blocks
			//mouse events underneath it while it's there; conversely this approach proved stable and reliable
			panel.panelNode.removeEventListener('DOMAttrModified', Firebug.CodeBurner.onPanelNodeAttrModified, false);
			panel.panelNode.addEventListener('DOMAttrModified', Firebug.CodeBurner.onPanelNodeAttrModified, false);
		},

		//abstraction for panel.panelNode->DOMAttrModified
		onPanelNodeAttrModified: function(e)
		{
			//we're looking for a node reference like "body"
			//which we'll get if the nodeBox DIV that surrounds the representation
			//of the body element has the "highlighted" class added to it
			var node = null;
			if(!Firebug.Inspector.inspecting) { return; }
			if(/nodeBox/.test(e.target.className) && /highlighted/.test(e.newValue))
			{
				var node = e.target.getElementsByTagName('div').item(0)
					.getElementsByTagName('span').item(0)
					.getElementsByTagName('span').item(0)
					.firstChild.nodeValue.toLowerCase();
			}

			//if we don't have a node, got nothing else to do
			if(node == null) { return; }

			//save a shortcut reference
			var tool = Firebug.CodeBurner;

			//get the html panel and a browser reference
			var htmlpanel = Firebug.currentContext.getPanel('html');
			var browser = htmlpanel.context.browser

			//if the example-html panel is open,
			if(Firebug.currentContext.getPanel(tool.panelnames['example-html']).visible == true)
			{
				//delete the selection data property, so that if you switch away and back
				//to this tab, the last selection is still there (but we don't delete it when
				//viewing that example, for the same reason)
				delete htmlpanel.egselectiondata;

				//now populate the panel with this selection
				tool.populateExamplePanel(browser, node, 'elements', null);
			}
			//otherwise just save this information in lieu of its next opening
			else
			{
				htmlpanel.egselectiondata = [browser, node, 'elements', null];
			}
		},

		//add a mousedown handler to a panel that passes the selected node
		//to populate our example panel, if it's already open
		addMouseDownListener: function(browser, panel)
		{
			//[remove and] add the listener; we have to do this every time
			//partly because panels are created on the fly and hence conditions change,
			//and partly because our context changes too (eg when firebug is detached)
			panel.document.removeEventListener('mousedown', Firebug.CodeBurner.onPanelMouseDown, false);
			panel.document.addEventListener('mousedown', Firebug.CodeBurner.onPanelMouseDown, false);
		},

		//abstraction for panel.document->onmousedown
		onPanelMouseDown: function(e)
		{
			//don't respond to the right mouse button
			//we have the contextmenu listener for that
			if(e.which == 3) { return; }

			//save a shortcut reference
			var tool = Firebug.CodeBurner;

			//get the current panel from target node (plus safety return)
			//and get a browser reference from that
			var panel = tool.getPanelFromNode(e.target);
			if(panel == null) { return; }
			var browser = panel.context.browser

			//handle this event according to panel
			if(panel.name == 'html') { tool.handleHTMLMouseDownEvents(e, browser, panel); }
			else if(panel.name == 'stylesheet') { tool.handleCSSMouseDownEvents(e, browser, panel); }
		},

		//add a special mousedown listener for the DOM crumbtrail at the top
		addCrumbtrailMouseDownListener: function(browser, doc)
		{
			//get a reference to the panelStatus element
			var toolbar = doc.getElementById('fbPanelStatus');

			//[remove and] add the mousedown listener
			toolbar.removeEventListener('mousedown', Firebug.CodeBurner.onCrumbtrailMouseDown, false);
			toolbar.addEventListener('mousedown', Firebug.CodeBurner.onCrumbtrailMouseDown, false);
		},

		//abstraction for toolbar->onmousedown
		onCrumbtrailMouseDown: function(e)
		{
			//don't respond to the right mouse button
			//we have the contextmenu listener for that
			if(e.which == 3) { return; }

			//save a shortcut reference
			var tool = Firebug.CodeBurner;

			//save the target and its value
			//[an element name, converted to lower case just to be totally sure
			// and then parsed of any ID or class value]
			var target = e.originalTarget;
			var node = target.getAttribute('value');
			if(!node) { node = target.getAttribute('label'); }//at some point in firebug's development, this changed
			node = node.toLowerCase().replace(/^([a-z1-6]+).*$/, '$1');

			//get a browser reference from the example panel
			var browser = Firebug.currentContext.getPanel(tool.panelnames['example-html']).context.browser;

			//if we dont have the elements area dictonary, load it now
			if(CodeBurnerDictionary['elements'] == null) { Firebug.CodeBurner.loadDictionary('elements'); }

			//if the target is a panel status label
			//and its label value is in the dictionary
			if(/panelStatusLabel/.test(target.className)
				&& typeof CodeBurnerDictionary['elements'] != 'undefined'
				&& typeof CodeBurnerDictionary['elements'][node] != 'undefined')
			{
				//if the example-html panel is open,
				if(Firebug.currentContext.getPanel(tool.panelnames['example-html']).visible == true)
				{
					//delete the selection data property, so that if you switch away and back
					//to this tab, the last selection is still there (but we don't delete it when
					//viewing that example, for the same reason)
					delete Firebug.currentContext.getPanel('html').egselectiondata;

					//now populate the panel with this selection
					tool.populateExamplePanel(browser, node, 'elements', null);
				}
				//otherwise just save this information in lieu of its next opening
				else
				{
					Firebug.currentContext.getPanel('html').egselectiondata = [browser, node, 'elements', null];
				}
			}
		},

		//handle mousedown events in the html panel
		handleHTMLMouseDownEvents: function(e, browser, panel)
		{
			//convert or die!
			var target = e.target
			if(!target.className) { return; }

			//extract the node name and area according to what was clicked
			//we're only interested in attributes, attribute values, and elements
			//for an attribute node, also get the owner
			var node = null, area = null, owner = null;
			if(/nodeText/.test(target.className))
			{
				target = target.parentNode;
				if(/nodeLabelBox/.test(target.className))
				{
					target = target.getElementsByTagName('span').item(0);
				}
				else if(/nodeBox/.test(target.className))
				{
					target = target.parentNode.parentNode
						.getElementsByTagName('div').item(0)
						.getElementsByTagName('span').item(0)
						.getElementsByTagName('span').item(0);
				}
			}
			if(/nodeTag/.test(target.className))
			{
				node = target.firstChild.nodeValue.toLowerCase();
				area = 'elements';
			}
			else if(/nodeValue/.test(target.className))
			{
				node = target.parentNode.getElementsByTagName('span').item(0)
					.firstChild.nodeValue.toLowerCase();
				area = 'attributes';
				owner = target.parentNode.parentNode.getElementsByTagName('span')
					.item(0).firstChild.nodeValue.toLowerCase();
			}
			else if(/nodeName/.test(target.className))
			{
				node = target.firstChild.nodeValue.toLowerCase();
				area = 'attributes';
				owner = target.parentNode.parentNode.getElementsByTagName('span')
					.item(0).firstChild.nodeValue.toLowerCase();
			}

			//if we have a node and an area,
			if(node != null && area != null)
			{
				//if the example-html panel is open,
				if(Firebug.currentContext.getPanel(this.panelnames['example-html']).visible == true)
				{
					//delete the selection data property, so that if you switch away and back
					//to this tab, the last selection is still there (but we don't delete it when
					//viewing that example, for the same reason)
					delete Firebug.currentContext.getPanel('html').egselectiondata;

					//now populate the panel with this selection
					this.populateExamplePanel(browser, node, area, owner);
				}
				//otherwise just save this information in lieu of its next opening
				//we're saving this information as a property of the html panel
				//actually i'm not entirely sure why, it just feels like the right thing to do
				//give the trouble i had with global rerefences to the html example panel
				//it feels safer to save this data to a stable panel
				else
				{
					Firebug.currentContext.getPanel('html').egselectiondata = [browser, node, area, owner];
				}
			}
		},

		//handle mousedown events in the stylesheet panel
		handleCSSMouseDownEvents: function(e, browser, panel)
		{
			//extract the node name and area according to what was clicked
			var target = e.target, property = null, selector = null, atrule = null;
			if(!target.className) { return; }
			
			
			//***DEV examine the panel DIV's inner DOM and write it as a code example 
			//to the main content document, so that we can inspect it with firebug
			//try
			//{
			//	var str = '&lt;' + target.nodeName, attrs = target.attributes;
			//	for(var i=0; i<attrs.length; i++)
			//	{
			//		str += ' ' + attrs[i].name + '="' + attrs[i].value + '"';
			//	}
			//	str += '&gt;';
			//	
			//	window.content.document.getElementsByTagName('body').item(0).innerHTML = 
			//		'<pre style="font:12px monospace">' + str + '</pre><hr />'
			//		+ '<pre style="font:12px monospace">' 
			//		+ panel.panelNode.innerHTML
			//			.replace(/</g, '&lt;')
			//			.replace(/>/g, '&gt;')
			//			.replace(/(\&lt\;[^\/])/g, '\r$1')
			//		+ '</pre>';
			//}
			//catch(err){}
			

			//if the target is a property name, property value,
			//or delimiting colon or semi-colon, convert to parent rule div
			if(/css(PropName|PropValue|Colon|Semi)/.test(target.className))
			{
				target = target.parentNode;
			}

			//if the target is [now, or already was] a parent rule div
			//get a reference to the property it contains
			if(/cssProp/.test(target.className) && /editGroup/.test(target.className))
			{
				//[FBug1.6B] a change in structure in 1.6B means we have to be more precise about the reference
				//using the span with the class name "cssPropName", rather than just the first span we find,
				//property = target.getElementsByTagName('span').item(0).firstChild.nodeValue;
				for(var spans = target.getElementsByTagName('span'), i=0; i<spans.length; i++)
				{
					if(/cssPropName/.test(spans.item(i).className))
					{
						property = spans.item(i).firstChild.nodeValue;
						break;
					}
				}
			}

			//or if the target is a selector, 
			//get a reference to the selector text it contains
			else if(/cssSelector/.test(target.className))
			{
				selector = target.firstChild.nodeValue;
			}
			
			//[FBug1.6B] or if the target is a rule-header, get a reference to its selector;
			//do the same precision target finding as for cssPropName, for safety,
			//even though it's not known to be necessary for this particular context,
			//why risk running into the same problem later as I've just had to solve elsewhere!
			else if(/cssHead/.test(target.className))
			{
				for(var spans = target.getElementsByTagName('span'), i=0; i<spans.length; i++)
				{
					if(/cssSelector/.test(spans.item(i).className))
					{
						selector = spans.item(i).firstChild.nodeValue;
						break;
					}
				}
			}			
			
			//or if the target or its parent is an @import 
			//(no other at-rules show up in the CSS panel)
			//just set the atrule value to "@import"
			else if(/importRule/.test(target.className) || /importRule/.test(target.parentNode.className))
			{
				atrule = '@import';
			}

			//save the example data according to what we have
			var egdata = [];
			
			//for a property
			if(property != null)
			{
				//save the property and properties area
				egdata = [property, 'properties'];
			}
			
			//for a selector
			else if(selector != null)
			{
				//create an empty selectortypes array
				var selectortypes = [];
				
				//extract the selector types from the selector text
				var items = this.extractSelectorTypes(selector);
				
				//then extract the pseudo-nodes and add them to the array
				items = this.extractPseudoNodes(selector, items);
				
				//iterate through the items array, 
				//and add each one to the selectortypes array
				//providing that it's not already listed
				for(var j=0; j<items.length; j++)
				{
					if(!this.arrayContains(selectortypes, items[j]))
					{
						selectortypes.push(items[j]);
					}
				}
				//then sort it alphabetically
				selectortypes.sort();

				//save the first item and selectors area
				egdata = [selectortypes[0], 'selectors'];
			}
			
			//for an atrule
			else if(atrule != null)
			{
				//save the atrule and atrules area
				egdata = [atrule, 'atrules'];
			}

			//if we have egdata
			if(egdata.length > 0)
			{
				//if the example-stylesheet panel is open,
				if(Firebug.currentContext.getPanel(this.panelnames['example-stylesheet']).visible == true)
				{
					//delete the selection data property, so that if you switch away and back
					//to this tab, the last selection is still there (but we don't delete it when
					//viewing that example, for the same reason)
					delete Firebug.currentContext.getPanel('stylesheet').egselectiondata;

					//now populate the panel with the egdata
					this.populateExamplePanel(browser, egdata[0], egdata[1], null);
				}
				//otherwise just save this information in lieu of its next opening
				else
				{
					Firebug.currentContext.getPanel('stylesheet').egselectiondata = [browser, egdata[0], egdata[1], null];
				}
			}
		},
		
		

		//handle a click on an action link in search results
		handleActionLink: function(args)
		{
			//[FBug1.6B] we had to URI-encode the data before storing it in the attribute
			//[see this::addResults for notes], so now we have to decode it before parsing
			args = decodeURIComponent(args);
			
			//parse and split the args
			args = args.replace(/[\"]/g, '');
			args = args.split(',');
			var str = '';
			for(var i=0; i<args.length; i++)
			{
				if(args[i] == '-') { args[i] = null; }
				str += args[i] + '  [' + typeof args[i] + ']\n';
			}

			//get a browser reference and save it to args[0]
			args[0] = Firebug.currentContext.browser;

			//show and uncollapse the side panels deck
			//(we have to hide them when detaching firebug)
			this.deck.setAttribute('collapsed', 'false');
			this.splitter.setAttribute('collapsed', 'false');

			//get a reference to the example pane
			var egpanel = Firebug.currentContext.getPanel(this.panelnames['example-reference'])

			//save this info to the example selection args array
			//which will be used when the panel is re-opened
			//without a change in reference panel selection
			Firebug.currentContext.getPanel(this.panelnames['reference']).egselectionargs = args.slice(0, 4);

			//if the example panel is already open
			//populate it with this information
			if(egpanel.visible == true)
			{
				this.populateExamplePanel.apply(null, args.slice(0, 4));
			}

			//otherwise just open the examples panel
			//and it will autopopulate with the saved args
			else
			{
				Firebug.chrome.selectSidePanel(egpanel.name);
			}
		},


		//add a contextmenu listener to a panel
		addContextmenuListener: function(browser, panel, doc)
		{
			//if we have a doc argument, we use that as the document reference
			//for binding the popupshowing method to;
			//or if we don't have an explicit argument, then it's document
			if(typeof doc == 'undefined') { var doc = document; }

			//if we haven't already added the contextmenu listener to this panel
			//or this was explicitly called with a doc reference [from reattachContext]
			if(typeof doc != 'undefined' || typeof panel['spref-have-oncontextmenu'] == 'undefined')
			{
				//now we have! in fact we'll end up adding this once for each panel
				//even though some of them shae the same panel document
				panel['spref-have-oncontextmenu'] = true;

				//[remove and] add a mousedown listener so we can pre-save the panel target
				//(the target of oncontextmenu gives us the target XUL element
				// but we want the HTML element inside the panel)
				//* could we do that with the popupNode property -- does it exist here?
				panel.document.removeEventListener('mousedown', Firebug.CodeBurner.onBeforeContextMenu, false);
				panel.document.addEventListener('mousedown', Firebug.CodeBurner.onBeforeContextMenu, false);

				//add the contextmenu listener; i'm pretty sure we can't leverage getContextMenuItems
				//to do this, because we don't control the panel it's happening in; if we took
				//control of that method entirely then we'd have to re-implement its existing
				//functionality too, which would be eww [a messy business]
				panel.document.addEventListener('contextmenu', function(e)
				{
					//[remove and] add the popupshowing listener to the referenced doc
					doc.removeEventListener('popupshowing', Firebug.CodeBurner.onPanelPopupShowing, false);
					doc.addEventListener('popupshowing', Firebug.CodeBurner.onPanelPopupShowing, false);

				}, false);
			}
		},

		//abstracted method for panel.document->onmousedown
		//that's a target saving precursor for oncontextmenu
		onBeforeContextMenu: function(e)
		{
			Firebug.CodeBurner.panelTarget = e.originalTarget;
		},

		//abstracted method for doc->onpopupshowing
		onPanelPopupShowing: function(e)
		{
			//save a shortcut reference
			var tool = Firebug.CodeBurner;

			//get the current panel from target node (plus safety return)
			//then get the browser reference
			var panel = tool.getPanelFromNode(tool.panelTarget);
			if(panel == null) { return; }
			var browser = panel.context.browser;

			//call the relevant add context menu method
			if(panel.name == 'html') { tool.addToHTMLContextMenu(browser, panel, tool.panelTarget); }
			else { tool.addToCSSContextMenu(browser, panel, tool.panelTarget); }
		},

		//add a special contextmenu listener for the DOM crumbtrail at the top
		addToCrumbtrailContextmenuListener: function(browser, doc)
		{
			//get a reference to the panelStatus element
			var toolbar = doc.getElementById('fbPanelStatus');

			//remove and add the contextmenu listener
			toolbar.removeEventListener('contextmenu', Firebug.CodeBurner.onCrumbtrailContextMenu, false);
			toolbar.addEventListener('contextmenu', Firebug.CodeBurner.onCrumbtrailContextMenu, false);
		},

		//abstracted method for toolbar->oncontextmenu
		onCrumbtrailContextMenu: function(e)
		{
			//save a shortcut reference
			var tool = Firebug.CodeBurner;

			//save the target and its value
			//[an element name, converted to lower case just to be totally sure
			// and then parsed of any ID or class value]
			var target = e.originalTarget;
			var node = target.getAttribute('value')
			if(!node) { node = target.getAttribute('label'); }//at some point in firebug's development, this changed
			node = node.toLowerCase().replace(/^([a-z1-6]+).*$/, '$1');

			//if we dont have the elements area dictonary, load it now
			if(CodeBurnerDictionary['elements'] == null) { Firebug.CodeBurner.loadDictionary('elements'); }

			//if the target is a panel status label
			//and its label value is in the dictionary
			//add the lookup and code example items
			if(/panelStatusLabel/.test(target.className)
				&& typeof CodeBurnerDictionary['elements'] != 'undefined'
				&& typeof CodeBurnerDictionary['elements'][node] != 'undefined')
			{
				//get a browser reference from the example panel
				var browser = Firebug.currentContext.getPanel(tool.panelnames['example-html']).context.browser;

				//lookup item language
				var itemlang = tool.lang.getString('contextmenu.node')
					.replace('%node', node)
					.replace('%type', tool.lang
						.getString('node.elements'));

				//clear the context menu of any of our items
				tool.removeMenuItems(tool.contextmenu);

				//add a separator
				tool.addMenuSeparator(tool.contextmenu, target.ownerDocument);

				//add the lookup item
				tool.addMenuItem(tool.contextmenu, itemlang, function(e)
				{
					tool.lookupSearch(browser, node, 'elements', null);

				}, target.ownerDocument);

				//add the show example item and command listener
				//which populates the example panel directly if it's open
				//otherwise saves the data in lieu of its next opening
				tool.addMenuItem(tool.contextmenu, tool.lang.getString('contextmenu.example'), function(e)
				{
					//save this info to the example selection data array
					//which will be used when the html panel is re-opened
					//without a change in hmtl panel selection
					Firebug.currentContext.getPanel('html').egselectiondata = [browser, node, 'elements', null];

					//if the example-html panel is already open, populate it with this information
					if(Firebug.currentContext.getPanel(tool.panelnames['example-html']).visible == true)
					{
						tool.populateExamplePanel(browser, node, 'elements', null);
					}

					//otherwise just open the examples panel
					//and it will autopopulate with the saved data
					else
					{
						Firebug.chrome.selectSidePanel(tool.panelnames['example-html']);
					}

				}, target.ownerDocument);
			}
		},

		//add item(s) to the context menu in the html panel
		addToHTMLContextMenu: function(browser, panel, target)
		{
			//we want to find the node type (element or attribute),
			//the node name itself, and if it's an attribute the owner element name
			var type = null, node = null, owner = null;

			//if the target's parent is a text input (parent?? wtf!?)
			//then we've right-clicked on an attribute or attr value that's being edited
			//(we might also have clicked on the text inside an element,
			// but we can't search for that in the reference!)
			if(target.parentNode.nodeName.toLowerCase() == 'input')
			{
				//the type is attributes
				type = 'attributes';

				//store the field value - the attr name or value we're editing
				var value = target.parentNode.value;

				//the edit field isn't in situ, it's at the end of the panel's dom
				//and positioned on top, with the original node hidden [class~="collapsed"]
				//so we have to look for a span element that has
				//the "collapsed" attribute and the "editing" class
				//(there may be more than one collapsed element,
				//but only one at a time that's actually being edited)
				var spans = panel.panelNode.getElementsByTagName('span');
				for(var i=0; i<spans.length; i++)
				{
					if(spans[i].getAttribute('collapsed') && /editing/.test(spans[i].className))
					{
						var source = spans[i];
						break;
					}
				}

				//if we don't have a source we're done here
				if(typeof source == 'undefined') { return; }

				//if the source is an attribute name, store the original value
				//as the node name, and get its owner element
				if(/nodeName/.test(source.className))
				{
					node = value;
					owner = source.parentNode.parentNode.getElementsByTagName('span')
						.item(0).firstChild.nodeValue.toLowerCase();
				}
				//or if the source is an attribute value, convert the reference
				//to its owner attribute, then get the value as the node name
				//and get the owner element
				else if(/nodeValue/.test(source.className))
				{
					source = source.parentNode.getElementsByTagName('span').item(0);
					node = source.firstChild.nodeValue;
					owner = source.parentNode.parentNode.getElementsByTagName('span')
						.item(0).firstChild.nodeValue.toLowerCase();
				}
			}

			//otherwise we've just clicked on a regular node
			else
			{
				//target is a text node, so look at its parent span
				//and then normalize it, just in case
				if(target.nodeName == '#text')
				{
					target = target.parentNode;
					target.normalize();
				}

				//target is an angle bracket before a tag, so convert to tag
				//or target is an equals-sign, quote mark, or non-breaking space
				//around an attribute value, so convert to attribute
				//or target is the slash in a closing tag, so convert to tag
				if(/(node(LabelBox|Attr|LabelBox|CloseLabelBox))/.test(target.className))
				{
					target = target.getElementsByTagName('span').item(0);
				}
				//or target is an angle bracket after a tag, so convert to tag
				//or target is an attribute value, so convert to attribute
				else if(/(node(Bracket|Value))/.test(target.className))
				{
					target = target.parentNode.getElementsByTagName('span').item(0);
				}
				//or target is the text node inside an element, so convert to tag
				else if(/nodeText/.test(target.className))
				{
					target = target.parentNode;
					if(/nodeLabelBox/.test(target.className))
					{
						target = target.getElementsByTagName('span').item(0);
					}
					else if(/nodeBox/.test(target.className))
					{
						target = target.parentNode.parentNode
							.getElementsByTagName('div').item(0)
							.getElementsByTagName('span').item(0)
							.getElementsByTagName('span').item(0);
					}
				}

				//target is an element, so record the node type and get the tag name
				if(/nodeTag/.test(target.className))
				{
					type = 'elements';
					node = target.firstChild.nodeValue.toLowerCase();
				}

				//target is an attribute, so record the node type
				//and get the attr name and owner element tag name
				else if(/nodeName/.test(target.className))
				{
					type = 'attributes';
					node = target.firstChild.nodeValue;
					owner = target.parentNode.parentNode.getElementsByTagName('span')
						.item(0).firstChild.nodeValue.toLowerCase();
				}
			}

			//finally .. if we have a type and node value
			if(type != null && node != null)
			{
				//if you click on the tag name of the currently selected element
				//the context search does a full special search for that element
				//but if you click anywhere else, or on any other element or attribute
				//it just does a single item search for that
				var special = type == 'elements'
					&& panel.selection.nodeName.toLowerCase() == node
					&& /selected/.test(target.parentNode.parentNode.parentNode.className);

				//compile the language for this item
				if(special == true)
				{
					var itemlang = this.lang.getString('contextmenu.selection');
				}
				else
				{
					itemlang = this.lang.getString('contextmenu.node')
						.replace('%node', node)
						.replace('%type', this.lang
							.getString('node.' + type));
				}

				//clear the context menu of any of our items
				this.removeMenuItems(this.contextmenu);

				//add a separator
				this.addMenuSeparator(this.contextmenu);

				//add the item and command listener
				this.addMenuItem(this.contextmenu, itemlang, function(e)
				{
					//save a shortcut reference
					var tool = Firebug.CodeBurner;

					//if this is a special search, then all we need to do now
					//is open the reference panel, and it will all happen from there :)
					//	- this action is effectively identical to selecting an element
					//	  and then switching to the reference tab manually
					//but if it's not a special search, do a lookup search with the target
					special == true
						? Firebug.chrome.selectPanel(tool.panelnames['reference'])
						: tool.lookupSearch(browser, node, type, owner);

				});

				//also add a show example item to the menu
				this.addMenuItem(this.contextmenu, this.lang.getString('contextmenu.example'), function(e)
				{
					//save a shortcut reference
					var tool = Firebug.CodeBurner;

					//save a reference to the examples panel
					var egpanel = Firebug.currentContext.getPanel(tool.panelnames['example-html']);

					//save this info to the example selection data array
					//which will be used when the panel is re-opened
					//without a change in hmtl panel selection
					panel.egselectiondata = [browser, node, type, owner];

					//if the example panel is already open
					//populate it with this information
					if(egpanel.visible == true)
					{
						tool.populateExamplePanel(browser, node, type, owner);
					}

					//otherwise just open the examples panel
					//and it will autopopulate with the saved data
					else
					{
						Firebug.chrome.selectSidePanel(tool.panelnames['example-html']);
					}
				});
			}
		},

		//add to the context menu to the css or stylesheet panel
		addToCSSContextMenu: function(browser, panel, target)
		{
			//we want to find the property name, selector text or at-rule
			var property = null, selector = null, atrule = null;

			//if the target's parent is a text input (parent?? wtf!?)
			//then we've right-clicked on a value that's being edited
			//** this condition may not occur anymore -- i can't trigger it consciously
			//** right clicking on the edit area just shows the default copy/paste etc. menu
			if(target.parentNode.nodeName.toLowerCase() == 'input')
			{
				//store the field value - the property name or value we're editing
				var value = target.parentNode.value;

				//the edit field isn't in situ, it's at the end of the dom
				//and positioned on top, with the original node collapsed
				//so we have to look for a span elements that has
				//the "collapsed" attribute and the "editing" class
				//(there may be more than one collapsed element,
				//but only one at a time that's actually being edited)
				var spans = panel.panelNode.getElementsByTagName('span');
				for(var i=0; i<spans.length; i++)
				{
					if(spans[i].getAttribute('collapsed') && /editing/.test(spans[i].className))
					{
						var source = spans[i];
						break;
					}
				}

				//if we don't have a source we're done here
				//(this only happened once, couldn't replicate it,
				// shrugged and added this safety condition)
				if(typeof source == 'undefined') { return; }

				//if the source is a property name, store the
				//original value as the property value
				if(/cssPropName/.test(source.className))
				{
					property = value;
				}
				//or if the source is a property value, convert the reference
				//to its property name, then get the value as the property
				else if(/cssPropValue/.test(source.className))
				{
					//[FBug1.6B] a change in structure in 1.6B means we have to be more precise about the reference
					//using the span with the class name "cssPropName", rather than just the first span we find,
					//source = source.parentNode.getElementsByTagName('span').item(0);
					//property = source.firstChild.nodeValue;
					for(var spans = source.parentNode.getElementsByTagName('span'), i=0; i<spans.length; i++)
					{
						if(/cssPropName/.test(spans.item(i).className))
						{
							source = spans.item(i);
							property = source.firstChild.nodeValue;
							break;
						}
					}
				}
				//or if the source is a selector, store the
				//original value as the selector value
				else if(/cssSelector/.test(source.className))
				{
					selector = value;
				}
			}

			//otherwise we've just clicked on a regular node
			else
			{
				//if the target is a property name, property value,
				//or delimiting colon or semi-colon, convert to parent rule div
				if(/css(PropName|PropValue|Colon|Semi)/.test(target.className))
				{
					target = target.parentNode;
				}

				//if the target is [now, or already was] a parent rule div
				//get a reference to the property it contains
				if(/cssProp/.test(target.className) && /editGroup/.test(target.className))
				{
					//[FBug1.6B] a change in structure in 1.6B means we have to be more precise about the reference
					//using the span with the class name "cssPropName", rather than just the first span we find,
					//property = target.getElementsByTagName('span').item(0).firstChild.nodeValue;
					for(var spans = target.getElementsByTagName('span'), i=0; i<spans.length; i++)
					{
						if(/cssPropName/.test(spans.item(i).className))
						{
							property = spans.item(i).firstChild.nodeValue;
							break;
						}
					}
				}
				
				//or if the target is a selector, 
				//get a reference to the selector text it contains
				else if(/cssSelector/.test(target.className))
				{
					selector = target.firstChild.nodeValue;
				}
				
				//[FBug1.6B] or if the target is a rule-header, get a reference to its selector;
				//do the same precision target finding as for cssPropName, for safety,
				//even though it's not known to be necessary for this particular context,
				//why risk running into the same problem later as I've just had to solve elsewhere!
				else if(/cssHead/.test(target.className))
				{
					for(var spans = target.getElementsByTagName('span'), i=0; i<spans.length; i++)
					{
						if(/cssSelector/.test(spans.item(i).className))
						{
							selector = spans.item(i).firstChild.nodeValue;
							break;
						}
					}
				}			
				
				//or if the target or its parent is an @import 
				//(no other at-rules show up in the CSS panel)
				//just set the atrule value to "@import"
				else if(/importRule/.test(target.className) || /importRule/.test(target.parentNode.className))
				{
					atrule = '@import';
				}
			}

			//save a shortcut reference
			var tool = Firebug.CodeBurner;

			//if we have a property
			if(property != null)
			{
				//compile the language for this item; for this menu just remove the %type token
				//because property names can be quite long, and adding the type makes the menu too big
				var itemlang = this.lang.getString('contextmenu.node')
					.replace('%node', property)
					.replace('%type', '');

				//clear the context menu of any of our items
				this.removeMenuItems(this.contextmenu);

				//add a separator
				this.addMenuSeparator(this.contextmenu);

				//add the item and command listener
				this.addMenuItem(this.contextmenu, itemlang, function(e)
				{
					//do a lookup search
					tool.lookupSearch(browser, property, 'properties', null);
				});

				//also add a show example item
				this.addMenuItem(this.contextmenu, this.lang.getString('contextmenu.example'), function(e)
				{
					//if this is the stylesheet panel, show and uncollapse the side panels deck
					if(panel.name == 'stylesheet')
					{
						tool.deck.setAttribute('collapsed', 'false');
						tool.splitter.setAttribute('collapsed', 'false');
					}

					//get a reference to the appliable example pane
					var egpanel = Firebug.currentContext.getPanel(
						tool.panelnames['example-' + (panel.name == 'stylesheet' ? 'stylesheet' : 'html')])

					//which will be used when the panel is re-opened
					//without a change in hmtl panel selection
					Firebug.currentContext.getPanel('html').egselectiondata = [browser, property, 'properties', null];

					//if the example panel is already open
					//populate it with this information
					if(egpanel.visible == true)
					{
						tool.populateExamplePanel(browser, property, 'properties', null);
					}

					//otherwise just open the examples panel
					//and it will autopopulate with the saved data
					else
					{
						Firebug.chrome.selectSidePanel(egpanel.name);
					}
				});
			}
			
			//or if we have a selector
			else if(selector != null)
			{
				//create an empty array of selector types to return
				var selectortypes = [];
	
				//extract the selector types from the selector text
				var items = this.extractSelectorTypes(selector);
				
				//then extract the pseudo-nodes and add them to the array
				items = this.extractPseudoNodes(selector, items);
	
				//iterate through the items array, 
				//and add each one to the selectortypes array
				//providing that it's not already listed
				for(var j=0; j<items.length; j++)
				{
					if(!this.arrayContains(selectortypes, items[j]))
					{
						selectortypes.push(items[j]);
					}
				}
				//then sort it alphabetically
				selectortypes.sort();

				//clear the context menu of any of our items
				this.removeMenuItems(this.contextmenu);

				//add a separator
				this.addMenuSeparator(this.contextmenu);
				
				//add the item and command listener
				this.addMenuItem(this.contextmenu, this.lang.getString('contextmenu.selectors'), function(e)
				{
					//join the selectortypes array into a string and do a lookup search with it
					tool.lookupSearch(browser, selectortypes.join(','), 'selectors', null);
				});

				//also add a show example item
				this.addMenuItem(this.contextmenu, this.lang.getString('contextmenu.example'), function(e)
				{
					//show and uncollapse the side panels deck
					tool.deck.setAttribute('collapsed', 'false');
					tool.splitter.setAttribute('collapsed', 'false');

					//get a reference to the appliable example pane
					var egpanel = Firebug.currentContext.getPanel(tool.panelnames['example-stylesheet'])

					//open the example panel
					Firebug.chrome.selectSidePanel(egpanel.name);

					//populate it with information about the first selector
					tool.populateExamplePanel(browser, selectortypes[0], 'selectors', null);
				}); 
			}
			
			//or if we have an at-rule
			else if(atrule != null)
			{
				//clear the context menu of any of our items
				this.removeMenuItems(this.contextmenu);

				//add a separator
				this.addMenuSeparator(this.contextmenu);
				
				//add the item and command listener
				this.addMenuItem(this.contextmenu, this.lang.getString('contextmenu.node')
													.replace('%node', atrule)
													.replace('%type', ''), 
				function(e)
				{
					//join the selectortypes array into a string and do a lookup search with it
					tool.lookupSearch(browser, atrule, 'atrules', null);
				});

				//also add a show example item
				this.addMenuItem(this.contextmenu, this.lang.getString('contextmenu.example'), function(e)
				{
					//show and uncollapse the side panels deck
					tool.deck.setAttribute('collapsed', 'false');
					tool.splitter.setAttribute('collapsed', 'false');

					//get a reference to the appliable example pane
					var egpanel = Firebug.currentContext.getPanel(tool.panelnames['example-stylesheet'])

					//open the example panel
					Firebug.chrome.selectSidePanel(egpanel.name);

					//populate it with information about the at-rule
					tool.populateExamplePanel(browser, atrule, 'atrules', null);
				});
			}
		},

		//add a keyup listener, from which we can get changes in selection
		//that are triggered by keyboard navigation actions
		addKeyUpListener: function(browser, panel)
		{
			//[remove and] add the keyup listener
			panel.document.removeEventListener('keyup', Firebug.CodeBurner.onPanelKeyUp, false);
			panel.document.addEventListener('keyup', Firebug.CodeBurner.onPanelKeyUp, false);
		},

		//abstraction for panel->onkeyup
		onPanelKeyUp: function(e)
		{
			//we're only interested in keyup actions from the up or down arrow keys
			//as those are the ones that move between nodes in the html dom
			if(!/^(38|40)$/.test(e.keyCode.toString())) { return; }

			//save a shortcut reference
			var tool = Firebug.CodeBurner;

			//get the html panel and the browser reference
			var htmlpanel = Firebug.currentContext.getPanel('html');
			var browser = htmlpanel.context.browser;

			//get the new selection from the html panel (including a safety condition)
			if(typeof htmlpanel.selection == 'undefined' || htmlpanel.selection == null) { return; }
			var node = htmlpanel.selection.nodeName.toLowerCase();

			//if the example-html panel is open,
			if(Firebug.currentContext.getPanel(tool.panelnames['example-html']).visible == true)
			{
				//delete the selection data property, so that if you switch away and back
				//to this tab, the last selection is still there (but we don't delete it when
				//viewing that example, for the same reason)
				delete htmlpanel.egselectiondata;

				//now populate the panel with this selection
				tool.populateExamplePanel(browser, node, 'elements', null);
			}
			//otherwise just save this information in lieu of its next opening
			else
			{
				htmlpanel.egselectiondata = [browser, node, 'elements', null];
			}
		},




		//populate the example panel with information for a node
		populateExamplePanel: function(browser, node, area, owner)
		{
			//***DEV
			//alert('populateExamplePanel(\n'
			//	+ '\tbrowser=' + browser + '\n'
			//	+ '\tnode="' + node + '"\n'
			//	+ '\tarea="' + area + '"\n'
			//	+ '\towner=' + (typeof owner == 'string' ? '"' : '') + owner + (typeof owner == 'string' ? '"' : '') + '\n'
			//	+ '\t);');
			
			
			//this continually refreshes the hack flag
			//so that every instance gets the chance to try again
			//nb. with this cycle we probably don't need the context deletions
			//but i've left them there anyway in case this bit goes or changes
			if(typeof this.ff2u7hack != 'undefined')
			{
				if(this.ff2u7hack == false)
				{
					delete this.ff2u7hack
				}
				else if(this.ff2u7hack == true)
				{
					this.ff2u7hack = false;
				}
			}

			//get the currently visible panel, and hence its example panel
			//I did originally pass the panel reference in as an argument
			//but that proved to be not always possible, so this was the uniform solution
			var currentPanel = this.getVisiblePanel();
			if(currentPanel.panel != null) { var egpanel = currentPanel.egpanel; }
			else { return; }

			//clear any running code example load timer
			clearInterval(this.egtimer);
			this.egtimer = null;

			//if the node has an html namespace, remove it
			if(node.substring(0, 5) == 'html:') { node = node.substr(5, node.length); }

			//prepare the nodata object, in case we need it
			var nodata = {
				'message' : this.lang.getString('search.noresults')
					.replace('%node', node).replace('%type', this.lang.getString('node.' + area))
				};

			//if we dont have the area's dictonary, load it now
			if(CodeBurnerDictionary[area] == null) { Firebug.CodeBurner.loadDictionary(area); }

			//if we don't have a match, put up the no results message
			if(typeof CodeBurnerDictionary[area][node] == 'undefined')
			{
				this['search_noresults'].html.replace({ object: nodata }, egpanel.panelNode, null);
				return;
			}

			//get the summary information we need, according to area and owner...
			var summary = null, entry = CodeBurnerDictionary[area][node];

			//this entry has a single summary, so node is either an element or property
			//or its an attribute that applies to all elements
			if(/(elements|properties)/.test(area) || typeof entry.summary == 'string')
			{
				summary = entry.summary;
			}

			//this entry has multiple summaries, so node is an attribute,
			//and we have a summary that applies to this owner element
			else if(typeof entry.summary[owner] != 'undefined')
			{
				summary = entry.summary[owner];
			}

			//or we don't have a summary specifically for this element
			//but we do have a summary that applies to "other" elements
			else if(typeof entry.summary.other != 'undefined')
			{
				summary = entry.summary.other;
			}

			//otherwise we don't have a summary for this element
			//or a summary that applies to other elements
			//so we'll just have to put up the noresults message
			//tailored so it also mentions the owner element, for clarification
			//(eg. letting the user know that we have no record of "foo" attributes of "bar" elements,
			//but we might have a record of "foo" attributes more generally)
			else
			{
				nodata.message += ' ' + this.lang.getString('summary.owner').replace('%tag', owner.toUpperCase());
				this['search_noresults'].html.replace({ object: nodata }, egpanel.panelNode, null);
				return;
			}

			//create the hash to add to the iframe src
			//which is used with a :target selector to show the block we want
			var hash = 'cdb-eg-' + area + '-';
			
			//attributes have an extra token that indicates their owner
			if(area == 'attributes')
			{
				hash += (typeof CodeBurnerDictionary[area][node]['summary'][owner] == 'undefined' ? 'all' : owner) + '-';
			}

			//for selectors, or "Media Query" in atrules,
			//we extract the hash from the path
			//because the key is its name, not its ident
			if(area == 'selectors' || (area == 'atrules' && node == 'Media Query'))
			{
				var key = CodeBurnerDictionary[area][node]['path'].split('/');
				hash += key[key.length - 1];
			}
			//for at rules we do a little conversion
			else if(area == 'atrules')
			{
				hash += node.replace('-', '').replace('@', 'at-');
			}
			//if the property is !important, its demo is indexed as just "important"
			//because the "!" character is not allowed in element IDs
			else if(node == '!important')
			{
				hash += 'important';
			}
			//otherwise the ident is the key
			else
			{
				hash += node;
			}
	
			//convert xml:lang and xml:space attributes exceptions
			//which are indexed with their original name, but
			//their URL converts the colon to dash and nothing, respectively
			if(hash.indexOf('xml:') != -1)
			{
				hash = hash.replace('xml:lang', 'xml-lang');
				hash = hash.replace('xml:space', 'xmlspace');
			}

			//work out the path for the more link
			//the same way as we worked out the summary
			var morepath = '/';
			if(/(elements|properties)/.test(area) || typeof entry.path == 'string')
			{
				morepath = entry.path;
			}
			else if(typeof entry.path[owner] != 'undefined')
			{
				morepath = entry.path[owner];
			}
			else if(typeof entry.path.other != 'undefined')
			{
				morepath = entry.path.other;
			}

			//compile a data object for this example
			//save it globablly because we need to be able to
			//acccess it from the codeExampleLoaded method
			this.egdata = {
				'browser' : browser,
				'node' : area == 'elements' ? node.toUpperCase() : node,
				'area' : area,
				'owner' : owner,
				'caption' : this.lang.getString('example.caption.' + area)
					.replace('%type', this.lang.getString('node.' + area)),
				'summary' : summary,
				'link' : this.lang.getString('contextmenu.node')
					.replace('%node', node).replace('%type', this.lang.getString('node.' + area)),
				//OLD//'morehref' : this.referenceURL + morepath,
				'morehref' : this.referenceURL + morepath + this.queryTracker,
				'moretext' : this.lang.getString('link.fulltext'),
				'moretitle' : this.lang.getString('link.description')
				};

			//output the example code
			var egoutput = this['example_code'].html.replace({ object: this.egdata }, egpanel.panelNode, null);

			//get a reference to the H1 heading
			//then if the node is a pseudo-element or pseudo-class, add a "pseudo-node" class name
			//this is used for an inverse condition, same as in the results table keycells
			var h1 = egoutput.getElementsByTagName('h1').item(0);
			if(area == 'selectors' && /^:/.test(node))
			{
				h1.className += ' pseudo-node';
			}
			//same thing for "Media Query" in the "atrules" area
			else if(area == 'atrules' && 'Media Query'.indexOf(node) != -1)
			{
				h1.className += ' mediaquery';
			}
	
			//if we have a live demo for this example, add the live demo link
			//making an adjustment to the node value if it's a -moz property
			var key = node; if(key.charAt(0) == '-') { key = key.substr(1, key.length); }
			if((area == 'properties' || area == 'selectors') && typeof Firebug.CodeBurner.liveDemos[key] != 'undefined')
			{
				//we have to get the reference to the existing "more" link relative to other content
				//rather than using getElementById, because of course there'll be three such links
				//because each of the three example panels shares the same panel document
				//a fact which has tripped me up so many times now it's embarrassing!
				var paragraphs = egoutput.getElementsByTagName('p');
				var morelinks = paragraphs.item(paragraphs.length - 1);
				morelinks.appendChild(egpanel.document.createTextNode(' | '));
				var demolink = morelinks.appendChild(egpanel.document.createElement('a'));
				demolink.className = 'morelink';
				//OLD//demolink.setAttribute('href', this.referenceURL + entry.path + '/demo');
				demolink.setAttribute('href', this.referenceURL + entry.path + '/demo' + this.queryTracker);
				demolink.appendChild(egpanel.document.createTextNode(Firebug.CodeBurner.lang.getString('link.livedemo')));
			}

			//now we have to create the iframe that will load the actual code example
			//we have to do this manually because the version of domplate that
			//comes with firebug 1.2.1 doesn't support IFRAME()
			//[my bad for developing most of this using 1.3b)
			//we have to get the reference to the example div by reference to
			//the output we just generated, because the action of outputting
			//may change our egpanel reference [because all our example panels
			//have the same element ID but share a document, as explained in codeExampleLoaded()]
			//then we're going to overwrite the loading message straight away ...
			//actually before it's finished loading ... not ideal, but the persistent load message
			//turned out to be a royal pain in the tradesman's, more trouble than it's worth,
			var example = egoutput.getElementsByTagName('div').item(1);
			var space = (egpanel.panelNode.offsetHeight - egoutput.offsetHeight - 7);
			example.innerHTML = '<iframe id="spref-example-frame"'
				+ ' src="chrome://sitepointreference/content/examples/' + area + '.html#' + hash + '"'
				+ '></iframe>';
		},

		//code example loaded method is called by a window.onload handler
		//in the iframe document itself, which passes up a reference to
		//its document, so that we can get the height of the visible code example
		codeExampleLoaded: function(doc)
		{
			//get a reference to the currently visible example panel
			//and silently fail if we fail to find a reference
			//(we always will find a reference, this is just a safety condition)
			for(var i in this.panelnames)
			{
				if(!this.panelnames.hasOwnProperty(i) || !/example\-/.test(i)) { continue; }
				var panel = Firebug.currentContext.getPanel(this.panelnames[i]);
				if(panel.visible == true)
				{
					var egpanel = panel;
				}
			}
			if(typeof egpanel == 'undefined') { return; }

			//save a reference to the code example iframe;
			//just as when we created the iframe in the first place,
			//we have to use a relative reference to get it, rather than
			//egpanel.document.getElementById() - because egpanel.document refers to the entire
			//panel document, which stores all the side panels, and therefore
			//has up to three copies of our example panel, all with the same id,
			//but belonging to different parent panels;
			//getElementById returns whichever was created first.
			//with hindsight that's not good, but its too much hassle to change it now
			var egframe = egpanel.panelNode.getElementsByTagName('iframe').item(0);

			//get the content height
			var egheight = doc.body.offsetHeight;

			//if the content height is zero that would be because nothing matches
			//the fragment ID, and hence there's no code example to display for it
			//** isn't there a better way to detect this state?
			if(egheight == 0)
			{
				//however it might also be due to an issue in firefox2/ubuntu7
				//where the height always comes back as zero the first time
				//any code example is viewed this session or page view
				//so in that situation let's just repopulate the code example again
				//using the information we saved just a moment ago ...
				//... so now it's the second time, and it shows up just fine :)
				//we use a once-only flag inside this condition, obviously
				//so that our caveat doesn't recur infinitely; but there's no further platform or browser
				//check in case the same thing should happen in any other environment;
				//effectively we're creating a general opportunity to "try again".
				//and indeed, this does come in useful more generally in maintaining
				//the stability of the code example outputs between in-browser / detached windows
				//so we maintain a cycle of create->change->delete with this flag, and also
				//explicitly delete it when the context changes (window is dettached or closed)
				if(typeof this.ff2u7hack == 'undefined')
				{
					this.ff2u7hack = true;
					this.populateExamplePanel(
						this.egdata.browser,
						this.egdata.node.toLowerCase(), //reconvert back to lower case so it matches the dictionary key
						this.egdata.area,
						this.egdata.owner
						);
					return;
				}

				//otherwise put up the "no code example" message
				var nocode = egframe.parentNode.insertBefore(egpanel.document.createElement('p'), egframe);
				nocode.setAttribute('class', 'nocode');
				nocode.appendChild(egpanel.document.createTextNode(this.lang.getString('example.nocode')
					.replace('%node', this.egdata.node.toLowerCase())
					.replace('%type', this.lang.getString('node.' + this.egdata.area))));
				return;
			}

			//if the content width is greater than the iframe width
			//add some leeway to the height and instructions position to allow for the overflow-x scrollbar
			if(doc.body.offsetWidth > egframe.offsetWidth)
			{
				egheight += 18;
			}

			//get various heights to work out if the example will overflow the panel
			//and if so restrict its height so it has a vertical scrollbar
			var heights = {
				'content' : egframe.parentNode.parentNode.offsetHeight,
				'panel' : egpanel.panelNode.offsetHeight
				};
			if(heights.content + egheight > heights.panel)
			{
				egheight = (heights.panel - heights.content + 10);
			}

			//set the iframe height as specified
			egframe.style.height = egheight + 'px';
		},




		//process the "standard" value in a search results entry
		//to create a standard description and image name
		processStandardValue: function(entry)
		{
			if(typeof entry.standard_description == 'undefined')
			{
				entry.standard_description = this.lang.getString('standard.' + entry.standard);
				switch(entry.standard)
				{
					case 'yes' :
						entry.standard_image = 'standard.png';
						break;

					case 'old' :
						entry.standard_image = 'deprecated.png';
						break;

					default :
						entry.standard_image = 'proprietary.png';
				}
			}
			return entry;
		},

		//parse the support data string into an object of values to populate the table cells
		processSupportData: function(entry)
		{
			if(typeof entry.support == 'string')
			{
				var support = {}, browsers = entry.support.split(' ');
				for(var j=0, len=browsers.length; j<len; j++)
				{
					var additional = browsers[j].length == 3 && browsers[j].charAt(2) == '+';
					support[browsers[j].charAt(0)] = {
						'browsername' : this.browsernames[browsers[j].charAt(0)],
						'supportlevel' : this.supportlevels[browsers[j].charAt(1)]
							+ (additional ? this.lang.getString('support.plus') : ''),
						'supportclass' : this.supportkeys[browsers[j].charAt(1)],
						'title' : this.lang.getString('support.description')
							.replace('%browser', this.browsernames[browsers[j].charAt(0)])
							.replace('%support', this.lang.getString('support.title.' + browsers[j].charAt(1)))
							.replace('%additional', (additional ? this.lang.getString('support.title.plus') : ''))
						};
				}
				entry.support = support;
			}
			return entry;
		},

		//key sort a set of results
		//(more generally, this method sorts an array of objects
		//by the value of one of its string properties)
		keySort: function(inarray, key)
		{
			var values = [], outarray = [];
			for(var i=0; i<inarray.length; i++)
			{
				values.push(inarray[i][key]);
			}
			values.sort();
			for(i=0; i<values.length; i++)
			{
				for(var j=0; j<inarray.length; j++)
				{
					if(inarray[j][key] == values[i])
					{
						outarray.push(inarray[j]);
						inarray.splice(j, 1);
					}
				}
			}
			return outarray;
		},


		//trim a string of leading and trailing whitespace
		trim: function(str)
		{
			return str.replace(/^\s+|\s+$/g,"");
		},
	
	
	
		//check an array to see if it contains a member
		//this can check either a single array of member values
		//or an array of objects in which member values are contained in the "key" property
		//performing a case-insensitive search in both cases if the member values are strings
		//it will also return true for loose equality, ie. if the input is 0 and the member is "0"
		arrayContains: function(ary, member)
		{
			member = member.toLowerCase();
			for(var i=0; i<ary.length; i++)
			{
				if
				(
					(typeof ary[i] == 'string' && ary[i].toLowerCase() == member) 
					||
					(typeof ary[i] == 'object' && typeof ary[i]['key'] == 'string' && ary[i]['key'].toLowerCase() == member)
					||
					(ary[i] == member) 
					||
					(typeof ary[i] == 'object' && ary[i]['key'] == member)
				)
				{
					return true;
				}
			}
			return false;
		},
		
	

		//add a single result to the current search results set or add multiple results recursively if necessary
		//(attribute information may contain multiple entries, one for each element it applies to)
		addResults: function(area, term, entry, match, owner)
		{
			//if the entry values are strings then this is a single result, so proceed to add it to the results array
			//if one is then they all will be, in equal numbers, so we only need to test one of them
			//except that "support" gets further processing, so we'll have to test one that doesn't; summary will do
			if(typeof entry.summary == 'string')
			{
				//if we don't have an owner property
				if(typeof entry.owner == 'undefined')
				{
					//if the area is not attributes define it empty
					if(area != 'attributes')
					{
						entry.rawowner = null;
						entry.owner = '';
					}

					//otherwise this attribute must belong to all elements
					else
					{
						entry.rawowner = 'all';
						entry.owner = ' ' + this.lang.getString('summary.common');
					}
				}

				//count the current number of results
				//so we can give each one an index starting from 1
				var number = this.results.length + 1;

				//add this result
				this.results.push({
					'area' : area,
					'number' : number,
					'key' : area == 'elements' ? term.toUpperCase() : term,
					'link' : this.lang.getString('link.text'),
					
					//[FBug1.6B] URI-encode the actiondata, otherwise it gets mis-implemented as a bunch of
					//individual attributes, eg: data that should come out like this:
					//	<a	actiondata='"-","fieldset","elements","null"'	>
					//actually becomes this:
					//	<a	-="" ,="" elements="" fieldset="" actiondata=""	>
					//possibly a change in how domplate works? maybe a false assumption that 
					//the attributes are wrapped in double-quotes? I don't know ... but it would be 
					//f*@#!ng typical if so, considering how much of a PITT domplate has been since day 1!
					//either way, I probably should have done this anyway - storing quote marks in attribute values
					//is kinda asking for trouble, given the generally arbitrary interchangeability of mark types :-O
					//'actiondata' : '"-","' + term + '","' + area + '","' + (entry.rawowner == null ? '-' : entry.rawowner) + '"',
					'actiondata' : encodeURIComponent('"-","' + term + '","' + area + '","' + (entry.rawowner == null ? '-' : entry.rawowner) + '"'),

					'title' : this.lang.getString('link.description'),
					'actiontitle' : this.lang.getString('contextmenu.example'),
					'match' : match,
					'entry' : entry
					});
			}

			//but if the entry values are objects we need to split them up and add each one individually
			//this will because the entry is an attribute that has entries for different owner elements
			else
			{
				for(var i in entry.summary)
				{
					if(!entry.summary.hasOwnProperty(i)) { continue; }

					//if the owner argument is not null, we only want
					//attribute definitions that match that element
					//or that apply to all elements
					if(owner == null || owner == i || i == 'other' || i == 'all')
					{
						//create a new entry with this set of values
						var childentry = {
							'path' : entry.path[i],
							'summary' : entry.summary[i],
							'standard' : entry.standard[i],
							'support' : entry.support[i],
							//add a value for the attribute's owner element
							//unless we have an owner argument, in which case it's implied
							//also save its raw value, which we can use as an argument
							//for the show code example call
							'rawowner' : owner == null
								? (i == 'other' ? 'all' : i)
								: i,
							'owner' : owner == null
								? ' ' + (
										i == 'other'
										? this.lang.getString('summary.common')
										: this.lang.getString('summary.owner').replace('%tag', i.toUpperCase())
										)
								: '',
							};

						//don't ya just love recursion :D
						this.addResults(area, term, childentry, match);

						//if we have a specific owner, and we found its result
						//don't continue to add generic results for the same attribute
						if(owner == i) { break; }
					}
				}
			}
		},


		//finalize and output the results set
		finalizeResults: function(total, term, area, special, manual)
		{
			//iterate through the results in order to
			//process the entry values, like standard and support
			for(i=0; i<this.results.length; i++)
			{
				//process the standard value to create a description and image name
				this.results[i].entry = this.processStandardValue(this.results[i].entry);

				//parse the support data string into an object of values to populate the table cells
				this.results[i].entry = this.processSupportData(this.results[i].entry);
			}

			//add to the total number of results
			total += this.results.length;

			//key sort the results
			this.results = this.keySort(this.results, 'key');

			//compile a data object for the results
			var data = {
				'platform' : this.platform,
				'number' : this.results.length,
				'term' : term,
				'area' : area,
				'referenceurl' : this.referenceURL,
				'querytracker' : this.queryTracker,
				'caption' : this.lang.getString((special == true ? 'search.caption.' : 'search.option.') + area),
				'captionclass' : area + (special == true ? ' special' : ''),
				'tablestate' : this.prefservice.getCharPref('tablestates.' + area),
				'results' : this.results
				};

			//write the results to the output area
			this['searchresults_caption'].html.append({ object: data }, this.output, null);
			var table = this['searchresults_code'].html.append({ object: data }, this.output, null);


			//if the table is initially collapsed,
			//change the header toggle icon accordingly
			//nb. once again we have to allow for a trailing space in firefox 3.5
			if(table.className.indexOf('collapsed') != -1)
			{
				var twisty = table.previousSibling.firstChild;
				twisty.className = 'twisty closed';
			}

			//iterate through the keycells to do some post-processing tasks:
			//adding class names to specific cells to change their styling
			//and creating indicators for substring matches, which need to be 
			//identified using the same boundary-start regex as the original search
			//so that we indicate the actual character that was matched, not just 
			//the first instance of that character (eg. if "t" matches ":nth-of-type" 
			//we must match the "t" in "type" not the "t" in "nth") 
			var keycells = table.getElementsByTagName('th'),
				keyreg = new RegExp(this.startchars + '(' + data.term + ')', 'i');
			for(var k=0; k<keycells.length; k++)
			{
				//get the key term text inside the cell
				var keytext = keycells[k].firstChild.innerHTML;
				
				//if the key is a pseudo-element or pseudo-class, add a "pseudo-node" class name
				//this is actually used for an inverse condition because it's the easiest to detect
				//so that selector results which are *not* pseudo-elements|classes 
				//(ie, they're just simple selectors) are not presented in a monospaced font
				if(area == 'selectors' && /^:/.test(keytext))
				{
					keycells[k].className += ' pseudo-node';
				}
				
				//same thing for "Media Query" in the "atrules" area
				else if(area == 'atrules' && 'Media Query'.indexOf(keytext) != -1)
				{
					keycells[k].className += ' mediaquery';
				}
	
				//if this was a manual search (ie. one that began with manual input
				//rather than being called from a node search in the HTML panel)
				if(manual == true)
				{
					//replace the key term in the results with surrounding wrappers to indicate the search term
					//this includes boundary symbols (dash, space, colon, at symbol or exclamation mark)
					//we're using a <u> because that's the element that makes sense, and because 
					//it's not being used for anything else; and originally I just left it as a underline, 
					//but it's actually now styled as a dotted bottom-border because I was becoming 
					//concerned that it might get confused with link styling; of course you can actually 
					//click it, so maybe the difference is fairly hypothetical, but it isn't a URL link
					//it's a behavioral trigger, so I still reckon the difference matters in some sense!
					keycells[k].firstChild.innerHTML = keytext.replace(keyreg, '$1<u>$2</u>');
							
					//now if a <u> was added (safety check), copy its parent title attribute
					//so that we still get the tooltip if hovering directly over it
					var u = keycells[k].getElementsByTagName('u');
					if(u.length == 1)
					{
						u = u.item(0);
						u.setAttribute('title', u.parentNode.getAttribute('title'));
					}
				}
			}
	
			//return the total number of results up to the calling scope
			return total;
		},



		//do a look-up search from HTML panel conext menu / example pane
		lookupSearch: function(browser, node, type, owner)
		{
			//we'll need to set a flag so that when we open our panel
			//the special search doesn't kick in automatically
			//then we'll be free to implement the individual item search
			this.noautosearch = true;

			//open our panel, and collapse its side deck
			//(not usually necessary, but might be when firebug is detached
			//and we haven't yet viewed the reference panel in this detachment session)
			Firebug.chrome.selectPanel(this.panelnames['reference']);
			this.collapseSidePanelsDeck();

			//clear the output area
			this.clearPanelOutput();

			//select the applicable area checkbox
			this.setAreaSelections(type);

			//write the term to the query textbox
			//for selectors we need to do some conversion of the value
			//which isn't necessary for others, but won't affect them either
			//they'll still output the same value as they would without this process
			this.searchform.query.value = node.toLowerCase().split(' ')[0];
	
			//finally do the single search, accepting no substring matches
			//by passing the owner argument we ensure that, if node is an attribute,
			//we only get the result the applies to this element
			this.doSearch([type], node, 'none', false, owner, false)
		},

		//perform an automatic search from textbox input
		autoSearch: function(e, areas)
		{
			//clear the output area
			this.clearPanelOutput();

			//we need the textbox reference, and the character of the key that was pressed
			var textbox = e.target,
				character = String.fromCharCode(e.charCode);

			//if we have a selection we have to re-implement over-typing
			//and in stages since we haven't yet inserted the character that was just typed
			//so first, save the last fragment if there is one (anything after the selection end to the end)
			//and then delete everything from the selection start to the end
			var fragment = textbox.selectionEnd > textbox.selectionStart
				? textbox.value.substring(textbox.selectionEnd, textbox.value.length)
				: '';
			textbox.value = textbox.value.substr(0, textbox.selectionStart);

			//if the input is valid [we only allow input that's alphanumeric,
			//dash (some attributes and properties), or colon (for namespaces)]
			//and if we aren't about to exceeded the query max length
			//[the maxlength attr doesn't seem to working in this environment]
			if(new RegExp(this.queryinput, 'i').test(character) && textbox.value.length < parseInt(this.querymax, 10))
			{
				//insert the character that was just typed
				textbox.value += character;

				//save the current cursor position, in case
				//the selection is in the middle of some text
				var position = textbox.value.length;

				//add the fragment
				//textbox.value += fragment;

				//move the cursor [back] to its stored position
				//textbox.selectionStart = position;
				//textbox.selectionEnd = position;

				//-- we're still losing the last fragment  --//
				//-- the commented code above doesn't work --//
			}

			//do a final validity pass to remove any lingering invalid characters from the querybox value
			//the earlier tests block input and serve to notify the user of input that won't be searched for
			//but it's still possible to paste invalid data, and then delete or keep typing,
			//and for those invalid charatcers to make it this far, which can trigger 
			//a regex compilation error if the value contains unmatched brackets etc.            / using a regex to parse a regex, lol /
			textbox.value = textbox.value.replace(new RegExp(this.queryinput.replace(/^\[/,'[^'), 'ig'), '');
					
			//iterate through the selected areas
			for(var i=0; i<areas.length; i++)
			{
				//route the value and all selected areas to the search method
				//accepting start substring matches, and invisibly coverting the input to lower case
				this.doSearch(areas, textbox.value.toLowerCase(), 'boundary-start', false, null, true);

				//we're done here now, beause we can only show
				//autocomplete data for one area at a time
				return;
			}
		},

		//find a case-insensitive starting substring match for autocomplete
		autoMatch: function(area, text)
		{
			//if we dont have the area's dictonary, load it now
			if(CodeBurnerDictionary[area] == null) { Firebug.CodeBurner.loadDictionary(area); }

			//iterate through its entries to look for a match
			for(var i in CodeBurnerDictionary[area])
			{
				if(!CodeBurnerDictionary[area].hasOwnProperty(i)) { continue; }
				if(text.toLowerCase() == i.substr(0, text.length))
				{
					return i;
				}
			}
			return null;
		},

		//do a special search for the currently-inspected element
		specialSearch: function(browser, selection)
		{
			//select all areas
			this.setAreaSelections('*');
	
			//save the selection element's tag name
			var element = selection.nodeName.toLowerCase();

			//write it to the search field
			this.searchform.query.value = element;

			//clear the output area
			this.clearPanelOutput();

			//keep a running total of how many total results we received
			var total = 0;

			//now route this element and the "elements" area to the search method
			//accepting no substring matches because we have a perfect term
			//the last flag is so we know it's a special search when generating results headers
			total += this.doSearch(['elements'], element, 'none', true, null, false);

			//now create an array of the node names of all the attributes
			//that have been defined for this element [preserving case]
			var attrs = [];
			for(var i=0, len=selection.attributes.length; i<len; i++)
			{
				attrs.push(selection.attributes[i].nodeName);
			}

			//join the array into a string, so we can send it all at once
			//which will make all the attributes come up as
			//a single set of search results, rather than lots of single ones
			//then route that string and the "attributes" area to search
			//also send the owner element so that we only get
			//attribute definitions that apply to this element
			//adding the number of results to the overall total
			total += this.doSearch(['attributes'], attrs.join(','), 'none', true, element, false);

			//next we want to add a table of other attribute that may be defined for this element
			//so send the element to the method that does that, and add the returned total
			//adding the number of results to the overall total
			total += this.otherAttributesSearch(element);

			//now we need to get the properties information for this element
			var properties = this.getStyleInformation(browser, selection);

			//join the properties array into a string, and route it to search the "properties" area
			total += this.doSearch(['properties'], properties.join(','), 'none', true, null, false);

			//then get the selectors information
			var selectors = this.getSelectorsInformation(selection);
			
			//join the selectors array into a string, and route it to search the "selectors" area
			//adding the number of results to the overall total
			total += this.doSearch(['selectors'], selectors.join(','), 'none', true, null, false);

			//then get the atrules information
			var atrules = this.getAtRulesInformation(selection);
			
			//join the atrules array into a string, and route it to search the "atrules" area
			//adding the number of results to the overall total
			total += this.doSearch(['atrules'], atrules.join(','), 'none', true, null, false);

			//if we had no results at all (which could happen searching for non-HTML elements with no applicable CSS)
			//then put up the no results message; we have to do this here rather than in doSearch
			//because of how these searches are arranged, to prevent no results messages
			//from showing up in the middle of other search results, 
			//eg. where no attributes are defined but other data is 
			if(total == 0)
			{
				var nodata = {
					'message' : this.lang.getString('search.noresults')
						.replace('%node', element).replace('%type', this.lang.getString('node.elements'))
					};
				this['search_noresults'].html.append({ object: nodata }, this.output, null);
			}
		},

		//perform a search
		doSearch: function(areas, term, substrings, special, owner, manual)
		{
			//if the term has an html namespace, remove it
			if(term.substring(0, 5) == 'html:') { term = term.substr(5, term.length); }

			//count the total number of results for all searches
			var total = 0;

			//iterate through the selected areas
			for(var a=0; a<areas.length; a++)
			{
				//if we dont have the area's dictonary, load it now
				if(CodeBurnerDictionary[areas[a]] == null) { Firebug.CodeBurner.loadDictionary(areas[a]); }
	
				//create (or reset) the array of search results
				this.results = [];

				//which reference are we looking in, based on the area
				var reference = /(elements|attributes)/.test(areas[a]) ? 'html' : 'css';

				//try to split the term up by commas, then trim each one
				//(this allows us to search for multiple terms at once
				// and have the results returned in a single results set
				// which we use when auto-searching for attributes
				// that apply to a selected element)
				var terms = term.split(',');
				for(var i=0; i<terms.length; i++)
				{
					//also convert to lowercase so that searches are case-insensitive
					//UNLESS the area is "selectors", or Media Query within "atrules", 
					//because we need to preserve case for them
					if(!(areas[a] == 'selectors' || (areas[a] == 'atrules' && 'Media Query'.indexOf(terms[i]) != -1)))
					{
						terms[i] = terms[i].toLowerCase();
					}
				}
				
				//now iterate through the terms and search for each one
				for(i=0; i<terms.length; i++)
				{
					//look for a perfect match (case insensitive)
					if(typeof CodeBurnerDictionary[areas[a]][terms[i]] != 'undefined')
					{
						this.addResults(areas[a], terms[i], CodeBurnerDictionary[areas[a]][terms[i]], 'exact', owner);
					}

					//look for substring matches, if applicable
					if(substrings != 'none')
					{
						//parse the term to escape any dashes, for regex's benefit
						terms[i] = terms[i].replace(/\-/, '\\-');

						//define a regex for what kind of substring matches are acceptable
						//in all cases, searching case insensitively
						switch(substrings)
						{
							//accept starting substrings
							case 'start' :
								var regex = new RegExp('^(' + terms[i] + ')', 'i');
								break;

							//accept boundary-start substrings, including space, dash,
							//colon, at symbol, or exclamation mark as a boundary
							case 'boundary-start' :
								var regex = new RegExp(this.startchars + '(' + terms[i] + ')', 'i');
								break;
	
							//accept ending substrings
							case 'end' :
								var regex = new RegExp('(' + terms[i] + ')$', 'i');
								break;

							//accept start and end substrings
							case 'start-end' :
								var regex = new RegExp('(^(' + terms[i] + '))|((' + terms[i] + ')$)', 'ig');
								break;

							//accept all substrings
							//the input value here would be "all", but using default
							//means that any value other than "start", "end" or "none" will go here
							default :
								var regex = new RegExp('(' + terms[i] + ')', 'i');
						}

						//search for those matches
						for(var j in CodeBurnerDictionary[areas[a]])
						{
							if(!CodeBurnerDictionary[areas[a]].hasOwnProperty(j)) { continue; }
							//if we can make a partial match
							if(regex.test(j) && j !== terms[i])
							{
								//if we don't already have a perfect match for this term
								if(!this.arrayContains(this.results, j))
								{
									this.addResults(areas[a], j, CodeBurnerDictionary[areas[a]][j], 'partial', owner);
								}
							}
						}
					}
				}

				//if we have results, finalize and output them
				//which returns the total number of results in this set
				if(this.results.length > 0)
				{
					total += this.finalizeResults(total, term, areas[a], special, manual);
				}

			}

			//if we had no results at all, and this is not a special search
			//output the no results message, adding the owner if we have one
			if(total == 0 && special == false)
			{
				//define the message
				var message = this.lang.getString('search.noresults')
						.replace('%node', term).replace('%type', this.lang.getString('node.' + areas[0]));

				if(areas[0] == 'attributes' && owner != null)
				{
					message += ' ' + this.lang.getString('summary.' + (owner == 'all' ? 'common' : 'owner'))
						.replace('%tag', owner.toUpperCase());
				}

				//put up the more detailed noresults tips
				//[it's easier to do this without domplate when the content contains inline HTML
				//because that then would require fragmenting the string into separate SPAN and A calls
				//which makes it more difficult to define coherent lang fragments]
				this.output.innerHTML = ''
					+ '<p class="noresults">' + message + '</p>'
					+ '<ul class="noresults-tips">'
					+ '<li>' + this.lang.getString('search.tip1') + '</li>'
					+ '<li>' + this.lang.getString('search.tip2') + '</li>'
					+ '<li>' + this.lang.getString('search.tip3')
								.replace('%term', term)
								.replace('%referenceurl', this.referenceURL)
								//the URL we're passing already contains "/search?q=%term"
								//so to add queryTracker on the end we have to convert
								//its leading "?" symbol to a separator "&" symbol;
								.replace('%querytracker', this.queryTracker.replace('?','&'))
								+ '</li>'
					+ '</ul>'
					+ '';
			}

			//return the total number of results,
			//so that callers can make use of that value
			return total;
		},

		//search for other attributes that may be defined for an element
		otherAttributesSearch: function(element)
		{
			//if the element name has an html namespace, remove it
			if(element.substring(0, 5) == 'html:') { element = element.substr(5, element.length); }

			//if we dont have the elements or attributes area dictonaries, load them now
			if(CodeBurnerDictionary['elements'] == null) { Firebug.CodeBurner.loadDictionary('elements'); }
			if(CodeBurnerDictionary['attributes'] == null) { Firebug.CodeBurner.loadDictionary('attributes'); }

			//this search is intended for HTML elements
			//so if the element is not HTML (ie. if it doesn't exist in the elements dictionary)
			//then just return zero results, and the "other attributes" table simply won't appear
			if(typeof CodeBurnerDictionary['elements'][element] == 'undefined') { return 0; }

			//counter for the total number of results for all searches
			var total = 0;

			//now, the results array currenty contains the results of an attribute search
			//so we want to extract from that all the keys, that is, the attributes it contains
			//so that we can compare and not include them in these results
			var specified = [];
			for(var i=0; i<this.results.length; i++)
			{
				specified.push(this.results[i].key);
			}

			//create or rest the results array
			this.results = [];

			//save a shortcut reference to the attributes dictionary, then iterate through it
			var attrs = CodeBurnerDictionary['attributes'];
			for(i in attrs)
			{
				//attributes results, don't include it again
				if(this.arrayContains(specified, i)) { continue; }

				//if the summary property of this entry is a string
				//and the attribute name doesn't begin with "on"
				//then this is a core attribute, so add it to the results
				//nb. we're not including event handling attribute because there's so many of them
				//it would just clutter the results for information that's obvious anyway
				if(typeof attrs[i].summary == 'string' && !/^(on)/.test(i))
				{
					this.addResults('attributes', i, attrs[i], 'exact', element);
				}

				//otherwise iterate through this entry object
				//to see if there's a member for this element
				//and if there is, add it to the results
				else
				{
					for(j in attrs[i].summary)
					{
						if(element == j)
						{
							this.addResults('attributes', i, attrs[i], 'exact', element);
							break;
						}
					}
				}
			}

			//if we have results, finalize and output them
			//which returns the total number of results in this set
			if(this.results.length > 0)
			{
				try { total += this.finalizeResults(total, element, 'otherattributes', true, false); }
				catch(err)
				{
					alert(err.message);
				}
			}

			//return the total number of results,
			//so that callers can make use of that value
			return total;
		}


	});







//close namespace wrapper
}});

