var testModel = require('../models/test.model');
var request = require('request')
var cheerio = require('cheerio');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

class mainController {
    async index(req, res) {
        let company = '';
        let street = '';
        let suburb = '';
        let postcode = '';
        let phone = '';
        let email = '';
        let site = '';

        const csvWriter = createCsvWriter({
            path: process.cwd() + '/output.csv',
            header: [
                { id: 'company', title: 'Company Name' },
                { id: 'street', title: 'Street Address' },
                { id: 'suburb', title: 'Suburb' },
                { id: 'postcode', title: 'Postcode' },
                { id: 'phone', title: 'Phone' },
                { id: 'email', title: 'Email' },
                { id: 'site', title: 'Website' },
            ],
            append: true
        });
        for (let j = 30; j < 31; j++) {
            let html = await sendRequest(j);
            let $ = cheerio.load(html)
            let result = $('.cell.in-area-cell.find-show-more-trial.middle-cell')
            let keys = Object.keys(result)
            keys.splice(keys.length - 4, 4)
            let csvData = [];
            for (let i = 0; i < keys.length; i++) {
                let company = '';
                let street = '';
                let suburb = '';
                let postcode = '';
                let phone = '';
                let email = '';
                let site = '';
                let key = keys[i]
                let consider = result[key]
                if (consider.children[1].children[1].children.length > 4) {
                    company = consider.children[1].children[1].children[1].children[1].children[1].children[1].children[0].children[0].children[0].data
                    let address = consider.children[1].children[1].children[1].children[1].children[1].children[1].children[1].children[0].children[0].data.split('-')[1]
                    address = address.replace(',', '')
                    let addressInfo = address.split(' ')
                    postcode = addressInfo.splice(addressInfo.length - 1, 1).join(' ');
                    street = addressInfo.splice(addressInfo.length - 1, 1).join(' ');
                    addressInfo.splice(0, 1)
                    suburb = addressInfo
                    suburb = suburb.join(' ')
                    try {
                        phone = consider.children[1].children[1].children[5].children[3].children[1].children[1].children[1].attribs.href
                    } catch (error) {
                        phone = 'No Number to contact'
                    }
                    try {
                        email = consider.children[1].children[1].children[5].children[3].children[1].children[3].children[1].attribs['data-email']
                    } catch (error) {
                        email = 'No email to contact'
                    }
                    try {
                        site = consider.children[1].children[1].children[5].children[3].children[3].children[1].children[1].attribs.href
                    } catch (error) {
                        site = 'No WEB site'
                    }
                } else {
                    try {
                        company = consider.children[1].children[1].children[1].children[1].children[1].children[0].children[1].children[1].children[1].children[0].children[1].children[0].children[1].children[1].children[1].children[0].children[0].data
                    } catch (error) {
                        company = consider.children[1].children[1].children[1].children[1].children[1].children[0].children[1].children[1].children[1].children[0].children[1].children[0].children[1].children[0].children[1].children[0].children[0].data
                    }
                    try {
                        var address = consider.children[1].children[1].children[1].children[1].children[1].children[0].children[1].children[1].children[1].children[0].children[1].children[0].children[1].children[1].children[3].children[0].children[0].data.split('-')[1]
                    } catch (error) {
                        var address = consider.children[1].children[1].children[1].children[1].children[1].children[0].children[1].children[1].children[1].children[0].children[1].children[0].children[1].children[0].children[3].children[0].children[0].data.split('-')[1]
                    }
                    address = address.replace(',', '')
                    let addressInfo = address.split(' ')
                    postcode = addressInfo.splice(addressInfo.length - 1, 1).join(' ');
                    street = addressInfo.splice(addressInfo.length - 1, 1).join(' ');
                    addressInfo.splice(0, 1)
                    suburb = addressInfo
                    suburb = suburb.join(' ')
                    try {
                        phone = consider.children[1].children[1].children[1].children[3].children[1].children[1].children[1].attribs.href
                    } catch (error) {
                        phone = 'No Number to contact'
                    }
                    try {
                        email = consider.children[1].children[1].children[1].children[3].children[1].children[3].children[1].attribs['data-email']
                    } catch (error) {
                        email = 'No email to contact'
                    }
                    try {
                        site = consider.children[1].children[1].children[1].children[3].children[3].children[1].children[1].attribs.href
                    } catch (error) {
                        site = 'No WEB site'
                    }
                }
                csvData.push({
                    company: company,
                    street: street,
                    suburb: suburb,
                    postcode: postcode,
                    phone: phone ? phone : '',
                    email: email,
                    site: site.length > 50 ? 'No WEB site' : site,
                })
            }

            // console.log(csvData)
            csvWriter.writeRecords(csvData)       // returns a promise
                .then(() => {
                    console.log('CSV is update with page ', j);
                });
        }
        res.json('ok');
    }
}

function sendRequest(page) {
    return new Promise((resolve, reject) => {
        let options = {
            url: `https://www.yellowpages.com.au/search/listings?clue=Catering&locationClue=All+States&pageNumber=${page}&referredBy=www.yellowpages.com.au&&eventType=pagination`,
            method: 'GET',
            headers: {
                cookie: '_hjDonePolls=167768; yellow-guid=3d7ab75b-7138-45c0-b407-12fc378980c0; clue=Catering; AMCVS_8412403D53AC3D7E0A490D4C%40AdobeOrg=1; s_ecid=MCMID%7C29244347244055802074594450807203647472; _vwo_uuid_v2=DDFC9A5CFB33318FA9F5C590BD5B5B34B|37e4e5b96dfb34d620510df7277afd8a; s_cc=true; _vis_opt_s=1%7C; _vis_opt_test_cookie=1; _vwo_uuid=DDFC9A5CFB33318FA9F5C590BD5B5B34B; _hjid=9bbd30a3-42c7-48b3-af73-e2936981d5e4; _hjIncludedInSample=1; JSESSIONID=D0CDEE4CA67CDD37B8DB2A3FA525D802; AMCV_8412403D53AC3D7E0A490D4C%40AdobeOrg=1585540135%7CMCIDTS%7C18314%7CMCMID%7C29244347244055802074594450807203647472%7CMCAAMLH-1582904218%7C11%7CMCAAMB-1582904218%7C6G1ynYcLPuiQxYZrsz_pkqfLG9yMXBpb2zX5dvJdYQJzPXImdj0y%7CMCOPTOUT-1582306618s%7CNONE%7CMCAID%7CNONE%7CvVersion%7C4.4.0; _vwo_ds=3%3Aa_0%2Ct_0%3A0%241582284601%3A35.16937015%3A%3A15_0%2C14_0%2C13_0%2C12_0%2C11_0%2C6_0%2C5_0%2C4_0%2C3_0%3A3_0%2C2_0%3A0; s_sq=%5B%5BB%5D%5D; BVImplmain_site=11347; BVBRANDID=53cd6c9c-0e13-4855-9ed2-adfa6e91de42; locationClue=All%20States; _vwo_sn=16243%3A4; _sdsat_Postcode=; _awl=3.1582304152.0.4-c5c93df0-6a7586ad06670840f1488714a0be4d33-6763652d617369612d6561737431-5e500b98-1',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36'
            }
        }
        request(options, (err, res, body) => {
            if (err) reject(err);
            resolve(body)
        })
    })
}

module.exports = mainController;