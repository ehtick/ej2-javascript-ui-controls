import { Accordion } from '../../src/accordion/index';

document.getElementById('render').addEventListener('click', renderAccordion);
document.getElementById('destroy').addEventListener('click', destoryAccordion);

let acrdnObj: Accordion;

function renderAccordion(): void {
    acrdnObj = new Accordion({
        dataSource: [{
            "ID": 1,
            "CompanyName": "Super Mart of the West",
            "Address": "702 SW 8th Street",
            "City": "Bentonville",
            "State": "Arkansas",
            "Zipcode": 72716,
            "Phone": "(800) 555-2797",
            "Fax": "(800) 555-2171",
            "Website": "http://www.nowebsitesupermart.com"
        }, {
            "ID": 2,
            "CompanyName": "Electronics Depot",
            "Address": "2455 Paces Ferry Road NW",
            "City": "Atlanta",
            "State": "Georgia",
            "Zipcode": 30339,
            "Phone": "(800) 595-3232",
            "Fax": "(800) 595-3231",
            "Website": "http://www.nowebsitedepot.com"
        }, {
            "ID": 3,
            "CompanyName": "K&S Music",
            "Address": "1000 Nicllet Mall",
            "City": "Minneapolis",
            "State": "Minnesota",
            "Zipcode": 55403,
            "Phone": "(612) 304-6073",
            "Fax": "(612) 304-6074",
            "Website": "http://www.nowebsitemusic.com"
        }, {
            "ID": 4,
            "CompanyName": "Tom's Club",
            "Address": "999 Lake Drive",
            "City": "Issaquah",
            "State": "Washington",
            "Zipcode": 98027,
            "Phone": "(800) 955-2292",
            "Fax": "(800) 955-2293",
            "Website": "http://www.nowebsitetomsclub.com"
        }],
        headerTemplate: "#Title",
        itemTemplate: '#Customer',
        enableRtl: false,
        enablePersistence: false,
        expandMode: "Single",
        expandedIndices: [0]
    });
    
    acrdnObj.appendTo('#accordion');
}

function destoryAccordion(): void {
    if (acrdnObj) {
        acrdnObj.destroy();
        acrdnObj = null;
    }
}
