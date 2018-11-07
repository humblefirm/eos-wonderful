eosiocpp -o super.token.wast super.token.cpp 
eosiocpp -g super.token.abi super.token.cpp
cp super.token.abi ./super.token/
cp super.token.wast ./super.token/
cp super.token.wasm ./super.token/