*** Settings ***
Library     Browser    auto_closing_level=KEEP
Resource    Keywords.robot

*** Test Cases ***
Test Web Form
    New Browser    chromium    headless=No  
    New Page       https://www.selenium.dev/selenium/web/web-form.html 
    Get Title      ==    Web form  
    Type Text      [name="my-text"]        ${Username}    delay=0.05 s
    Type Secret    [name="my-password"]    $Password      delay=0.05 s
    Type Text      [name="my-textarea"]    ${Message}     delay=0.05 s
    Select Options By        [name="my-select"]    value    ${DropdownValue}    delay=0.05 s
    Type Text        [name="my-datalist"]   ${DropdownDatalist}    delay=0.05 s
    Upload File By Selector    input[name="my-file"]    ${FileToUpload}
    Uncheck Checkbox    input[id="my-check-1"]
    Check Checkbox      input[id="my-check-2"]
    Click    [id="my-radio-2"]
    Type Text    [name="my-date"]    6/21/1997    delay=0.05 s
    Click    [id="my-radio-2"]
    Click    input[name="my-range"]
    Press Keys    input[name="my-range"]    Home
    Click With Options    button    delay=2 s
    Get Text       id=message    ==    Received!