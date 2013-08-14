// CBLIB2.0 :: CodeBurner Library v2.0
//******************************************************************************
// Copyright (c) 2010 SitePoint Pty Ltd. -- http://www.sitepoint.com/
//******************************************************************************
// This dictionary is CSS selectors, indexed by name or selector
//******************************************************************************
CodeBurnerDictionary.selectors =
{
	"__generated"	: "2009-08-07",
	"__edited"		: "2010-10-29"
	
	,"Universal Selector": {
		"path": "/css/universalselector",
		"summary": "matches any element type",
		"standard": "yes",
		"support": "E1 F3 S3 O3 C3"
		}
	,"Element Type Selector": {
		"path": "/css/elementtypeselector",
		"summary": "matches elements with the specified element type name",
		"standard": "yes",
		"support": "E3 F3 S3 O3 C3"
		}
	,"Class Selector": {
		"path": "/css/classselector",
		"summary": "selects elements with a specified class attribute value",
		"standard": "yes",
		"support": "E3 F3 S3 O3 C3"
		}
	,"ID Selector": {
		"path": "/css/idselector",
		"summary": "matches an element with a specific id attribute value",
		"standard": "yes",
		"support": "E3 F3 S3 O3 C3"
		}
	,"Attribute Selector": {
		"path": "/css/attributeselector",
		"summary": "selects elements based on attribute values",
		"standard": "yes",
		"support": "E1 F1 S1 O1 C1"
		}
	,"CSS3 Attribute Selector": {
		"path": "/css/css3attributeselectors",
		"summary": "additional attribute selectors offered by CSS3",
		"standard": "yes",
		"support": "E1 F3 S3 O3 C3"
		}
	,"Descendant Selector": {
		"path": "/css/descendantselector",
		"summary": "matches an element that\u2019s a descendant of a specified element",
		"standard": "yes",
		"support": "E1 F3 S3 O3 C3"
		}
	,"Child Selector": {
		"path": "/css/childselector",
		"summary": "selects an element that\u2019s the immediate child of a specified element",
		"standard": "yes",
		"support": "E1 F3 S3 O3 C3"
		}
	,"Adjacent Sibling Selector": {
		"path": "/css/adjacentsiblingselector",
		"summary": "selects an element that\u2019s an adjacent sibling to a specified element",
		"standard": "yes",
		"support": "E1 F3 S1 O3 C1"
		}
	,"General Sibling Selector": {
		"path": "/css/generalsiblingselector",
		"summary": "selects an element that\u2019s a sibling to a specific element",
		"standard": "yes",
		"support": "E1 F3 S3 O3 C3"
		}
	,":link": {
		"path": "/css/pseudoclass-link",
		"summary": "matches link elements that are unvisited",
		"standard": "yes",
		"support": "E3 F3 S3 O3 C3"
		}
	,":visited": {
		"path": "/css/pseudoclass-visited",
		"summary": "matches link elements that have been visited",
		"standard": "yes",
		"support": "E3 F3 S3 O3 C3"
		}
	,":active": {
		"path": "/css/pseudoclass-active",
		"summary": "matches any element that\u2019s being activated by the user",
		"standard": "yes",
		"support": "E1 F3 S3 O3 C3"
		}
	,":hover": {
		"path": "/css/pseudoclass-hover",
		"summary": "matches elements that are being designated by a pointing device",
		"standard": "yes",
		"support": "E1 F3 S3 O3 C3"
		}
	,":focus": {
		"path": "/css/pseudoclass-focus",
		"summary": "matches any element that\u2019s currently in focus",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":first-child": {
		"path": "/css/pseudoclass-firstchild",
		"summary": "matches any element that\u2019s the first child element of its parent",
		"standard": "yes",
		"support": "E1 F3 S3 O3 C3"
		}
	,":lang": {
		"path": "/css/pseudoclass-lang",
		"summary": "allows elements to be matched on the basis of their languages",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":nth-child": {
		"path": "/css/pseudoclass-nthchild",
		"summary": "matches elements on the basis of their positions within a parent element\u2019s list of child elements",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":nth-last-child": {
		"path": "/css/pseudoclass-nthlastchild",
		"summary": "matches elements on the basis of their positions within a parent element\u2019s list of child elements",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":nth-of-type": {
		"path": "/css/pseudoclass-nthoftype",
		"summary": "matches elements on the basis of their positions within a parent element\u2019s list of child elements of the same type",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":nth-last-of-type": {
		"path": "/css/pseudoclass-nthlastoftype",
		"summary": "matches elements on the basis of their positions within a parent element\u2019s list of child elements of the same type",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":last-child": {
		"path": "/css/pseudoclass-lastchild",
		"summary": "matches an element that\u2019s the last child element of its parent element",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":first-of-type": {
		"path": "/css/pseudoclass-firstoftype",
		"summary": "matches the first child element of the specified element type",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":last-of-type": {
		"path": "/css/pseudoclass-lastoftype",
		"summary": "matches the last child element of the specified element type",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":only-child": {
		"path": "/css/pseudoclass-onlychild",
		"summary": "matches an element if it\u2019s the only child element of its parent",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":only-of-type": {
		"path": "/css/pseudoclass-onlyoftype",
		"summary": "matches an element that\u2019s the only child element of its type",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":root": {
		"path": "/css/pseudoclass-root",
		"summary": "matches the element that\u2019s the root element of the document",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":empty": {
		"path": "/css/pseudoclass-empty",
		"summary": "matches elements that have no children",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":target": {
		"path": "/css/pseudoclass-target",
		"summary": "matches an element that\u2019s the target of a fragment identifier in the document\u2019s URI",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":enabled": {
		"path": "/css/pseudoclass-enabled",
		"summary": "matches user interface elements that are enabled",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":disabled": {
		"path": "/css/pseudoclass-disabled",
		"summary": "matches user interface elements that are disabled",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":checked": {
		"path": "/css/pseudoclass-checked",
		"summary": "matches elements like checkboxes or radio buttons that are checked",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":not": {
		"path": "/css/pseudoclass-not",
		"summary": "matches elements that aren\u2019t matched by the specified selector",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":first-letter": {
		"path": "/css/pseudoelement-firstletter",
		"summary": "represents the first character of the first line of text within an element",
		"standard": "yes",
		"support": "E1 F3 S3 O3 C3"
		}
	,":first-line": {
		"path": "/css/pseudoelement-firstline",
		"summary": "represents the first formatted line of text",
		"standard": "yes",
		"support": "E1 F2 S3 O2 C3"
		}
	,":before": {
		"path": "/css/pseudoelement-before",
		"summary": "specifies content to be inserted before another element",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,":after": {
		"path": "/css/pseudoelement-after",
		"summary": "specifies content to be inserted after another element",
		"standard": "yes",
		"support": "E0 F3 S3 O3 C3"
		}
	,"::selection": {
		"path": "/css/pseudoelement-selection",
		"summary": "represents a part of the document that\u2019s been highlighted by the user",
		"standard": "yes",
		"support": "E0 F0 S3 O3 C3"
		}
		
}
