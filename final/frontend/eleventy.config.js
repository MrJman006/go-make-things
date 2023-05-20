module.exports = function(eleventyConfig)
{
    let config = {};

    config.markdownTemplateEngine = 'njk';

    config.dataTemplateEngine = 'njk';

    config.htmlTemplateEngine = 'njk';

    config.dir = {};

    config.dir.input = "content";

    config.dir.output = "../_frontend";

    // The 'includes' path is relative to the 'input' dir.
    config.dir.includes = "../templates";

    // The 'layouts' path is relative to the 'input' dir.
    config.dir.layouts = "../templates/layouts";

    // The 'data' path is relative to the 'input' dir.
    config.dir.data = "../templates/data";

    return config;
};
