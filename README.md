# Bootstrapper

Bootstrapper is a handy Node.js command line application to manage templates and boilerplates.

Bootstrapper stores user-defined templates in its template folder where they are always available every time they are needed.

## Installing Bootstrapper

Bootstrapper is available via npm. I suggest to install it globally so the executable is always available without having to change the `$PATH`.

In order to install it just type the following into the terminal:

    sudo npm install -g bootstrapper
    
or, in case you want to avoid a global installation just type:

    npm install bootstrapper
    
Bootstrapper depends on [wrench-js](https://github.com/ryanmcgrath/wrench-js), as that was the most convenient way to quickly copy and delete directories recursively.

## How to

The semantic of the tool is very simple.

Show help information:

    mmarcon@wallace$ bootstrapper help
    
List all the available templates:

    mmarcon@wallace$ bootstrapper list
    * Just another template [My new test template for bootstrapper,  Created by Massimiliano Marcon on 14/04/2012]
    * My new test template [Hello,  Created by mmarcon on 14/04/2012]
    * Nokia Maps boilerplate app [A boilerplate to build a map-based application using the Nokia Maps API,  Created by Massimiliano Marcon on 14/04/2012]
    
Create an empty template (the tool requests some information on the new template):

    mmarcon@wallace$ bootstrapper generate
    
Add a template to the template database:

    mmarcon@wallace$ bootstrapper add path/to/template_directory
    
Remove a template from the template database:

    mmarcon@wallace$ bootstrapper remove "Template Name"
   
Use a template (creates a new folder containing the template files):
    
    mmarcon@wallace$ bootstrapper use
    
## Details
Bootstrapper stores all the data into `$HOME/.bootstrapper`.

The directory contains a `log` folder (currently unused) and a `templates` folder where all the templates are stored. The structure of a template is very simple:

    - template_name_lowercase
       |- template.json
       |- some_other_template.file
       |- some_subfolder
       
`template.json` is just a little JSON file that contains name, description, author and creation date for the template.

## Next steps
I am planning on adding a command that allows for adding templates to the local database from a remote source, e.g. a GIT repository. This will provide a key capability for people to share their templates with the rest of the community.