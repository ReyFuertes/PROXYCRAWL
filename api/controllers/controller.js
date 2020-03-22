
const catchAsync = require('../helpers/catch-async');
var cheerio = require('cheerio');
var fs = require('fs');

const parse = catchAsync(async (req, res, next) => {
  const https = require('https');
  const url = encodeURIComponent(req.query.url);
  const options = {
    hostname: 'api.proxycrawl.com',
    path: '/?token=' + req.query.token + '&url=' + url
  };

  https.request(options, (response) => {
    let body = '';
    response.on('data', chunk => body += chunk)
      .on('end', () => {
        const $ = cheerio.load(body);
        let tweets = [];

        //get available tweets
        $(".js-tweet-text-container p.tweet-text").each(function (i, item) {
          $(item).find('a').replaceWith('');
          tweets.push($(item).text().trim());
        });

        //data response
        const data = {
          name: $('a.ProfileNameTruncated-link').text().trim(),
          joinedDate: $('div.ProfileHeaderCard-joinDate').text().trim(),
          birthDate: $('div.ProfileHeaderCard-birthdate').text().trim(),
          bio: $('div.ProfileHeaderCard-bio').text().trim(),
          location: $('span.ProfileHeaderCard-locationText').text().trim(),
          followers: $('li.ProfileNav-item--followers span.ProfileNav-value').text().trim(),
          following: $('li.ProfileNav-item--following span.ProfileNav-value').text().trim(),
          tweets
        }

        //write/store
        fs.writeFileSync(`profiles/${$('a.ProfileNameTruncated-link').text().trim()}.json`, JSON.stringify(data));

        res.status(201).json({ data })
      });
  }).end();
})

module.exports = {
  parse
};