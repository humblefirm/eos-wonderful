eosio-cpp -o eoswonderful.token.wasm eoswonderful.token.cpp
eosio-abigen eoswonderful.token.cpp --output=eoswonderful.token.abi -contract=token
