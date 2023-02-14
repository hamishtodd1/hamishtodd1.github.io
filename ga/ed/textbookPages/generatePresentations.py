import os
os.chdir('C:/hamishtodd1.github.io/ga/ed/textbookPages')

ordinaryPage = open('../index.html', 'r').read()

prefix = ordinaryPage[ 0 : ordinaryPage.index('<!-- DIFFERENCES START -->') ] + '''    <link rel="stylesheet" href="edStyle.css">
</head>
<body>
    <script src="pageNumbers.js"></script>
'''

postfix = ordinaryPage[
    ordinaryPage.index('<!-- DIFFERENCES END -->'):
    ordinaryPage.index('// DIFFERENCE AGAIN')
] + 'init( textareaValueDefault );' + ordinaryPage[
    ordinaryPage.index('// DIFFERENCE ENDED AGAIN'):
]

for i in range(1,99):

    num = str(i)
    if(i < 10):
        num = '0' + num

    try:
        infixFile = open( './' + num + '.html', 'r' )
    except FileNotFoundError:
        break
    else:
        infix = infixFile.read()

        raw = prefix + '\n<script>\n' + infix + '\n</script>\n' + postfix
        withRelativeLinks = raw.replace(
            '<script src="', 
            '<script src="../').replace(
            '<link rel="stylesheet" href="',
            '<link rel="stylesheet" href="../')
        
        output = open( num + 'G.html', 'w')
        output.write(withRelativeLinks)
        output.close()

        print(num + " generated")

#scalar complex infinity euclidean vector
#just hide them
