import * as fs from 'node:fs';
import fetch from "node-fetch";
import * as cheerio from 'cheerio';
import * as Path from 'node:path';

const scrape_image = async (url, path, index) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const file_extention = get_url_extension(url);

    let location = path + '/' + index + '.' + file_extention;

    fs.writeFile(location, buffer, function (err) {
        if (err) console.log(err);
    });
}

const get_url_extension = (url) => {
    let new_url = url.split(/[#?]/)[0].split('.').pop().trim();
    return new_url.replace('/', '');
}

const scrape_page = async (url, selector) => {
	const response = await fetch(url);
    const $ = cheerio.load(await response.text());

    const date = Date.now();
    const time = new Date(date);

    const local_path = Path.resolve('.');
    let path = local_path + '/scraper-results-' + time.toISOString();

    if (!fs.existsSync(path)) {
        fs.mkdir(path, (err) => {
            if (err) {
                return console.error(err);
            }
            console.log('Directory created successfully!');
        });
    }

    let targets = [];
    $(selector).each(function() {
        let image = $(this).attr('href');
        targets.push(image);
        scrape_image(image, path, targets.length);
    })

    fs.writeFile(path + '/array.txt', 'Results of scaper\n', function (err) {
        if (err) console.log(err);
        else {

            let file = fs.createWriteStream(path + '/array.txt');
            targets.forEach(value => file.write(`${value}\n`));
        
            file.on('finish', () => {
                console.log(`Detail log of targets created ${path}`);
            });
            
            file.on('error', (err) => {
                console.error(`There is an error writing the log ${path} => ${err}`)
            });
            
            file.end();

        }
    });

}

const url = '';
const selector = ''; // <- Jquery selector
scrape_page(url, selector);
