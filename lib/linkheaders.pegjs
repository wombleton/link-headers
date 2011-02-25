links
  = links:link+ { 
    var arr = [],
      i;
    for (i = 0; i < links.length; i++) {
      arr.push(links[i]);
    }
    return arr;
  }

link
  = href:href ws attributes:attributes ','? ws {
    var obj = attributes; 
    obj['href'] = href; 
    return obj; 
  }

href
  = '<' href:url '>' ';' { 
    return href; 
  }

attributes
  = attrs:attribute+ {
    var obj = { },
       i;
    for (i = 0; i < attrs.length; i++) {
      obj[attrs[i].name] = attrs[i].value;
    }
    return obj; 
  }

attribute
  = name:name ws '=' ws v:value ';'? ws { return { name: name, value: v }; }

name
  = name:[a-zA-Z]+ { return name.join(''); }

value
  = ["] v:[^"]+ ["] { return v.join(''); } / v:[^";,]+ { return v.join(''); }

url
  = url:[^>]+ { return url.join(''); }

ws
  = spaces:[ ]*
