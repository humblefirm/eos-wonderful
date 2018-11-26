//EOS-Wonderful Token Contract
//https://github.com/humblefirm/eos-wonderful/

//Version 3.0
//Project : Inter-Contract
//Make all eos-wonderful tokens and eos-wonderful contracts interact#include <string>
#include <vector>
#include <eoswonderful.token.hpp>
#include <eosiolib/asset.hpp>
#include <eosiolib/eosio.hpp>
#include <eosiolib/crypto.h>
#include <eosiolib/time.hpp>
#include <eosiolib/print.h>

using namespace eosio;
using namespace std;
using namespace types;
class token : public contract
{
  public:
	token(account_name self)
		: contract(self)
	{
	}

	//계정 생성 비용 및 설정자 설정
	void setinfo(name id, asset token, asset coin)
	{
		//id : 설정 및 계좌 관리자
		//token : 계정 생성비 (토큰)
		//coin : 계정 생성비 (코인)
	}

	//계정 생성  코인/토큰|키/계정
	void create(boolean iseos, string creator, string account, string sadata)
	{
		//지불 방법|생성자|피생성자|{sadata}
		//{sadata} = {fee}|{sig}|{SaKey/SaName}
		//지불한 코인/토큰은 관리자 계정으로

		//생성자가 키인가?계정인가? -> sadata검증 + 적절한 테이블 로드 및 수정
		//피생성자가 키인가? 계정인가? -> 적절한 테이블 로드 및 수정
	}

	//토큰 발행
	void mint(string account, asset amount, string memo)
	{
		//대상자|발행량|메모

		//권한 확인
		auto info = info.find(0);
		name manager = info->manager;
		require_auth(manager);

		//정확성 확인
		Check_asset(amount);
		Check_memo(memo);

		//발행
		//name=true
		//key=false
		bool exist = false;
		if (Check_account(account))
		{
			name name = str_to_name(account);
			namebalance_table namebalance(_self, _self);
			auto itr_balance = namebalance.find(keytoid(to));
			if (itr_balance == namebalance.end())
				create_name()
		}
		else
		{
			keybalance_table keybalance(_self, _self);
			auto itr_balance = keybalance.find(keytoid(to));
			if (itr_balance == keybalance.end())
				exist = true;
		}

		if (exist)
		{
			usrbalance.modify(itr_balance, _self, [&](auto &r) {
				r.balance += amount;
			});
		}
		else
		{
			usrbalance.emplace(_self, [&](auto &r) {
				r.id = keytoid(to);
				r.user = to;
				r.nonce = 0;
				r.balance = amount;
				r.eos = amount - amount;
				r.eos.symbol = string_to_symbol(4, "EOS");
			});
		}
	}

	void transfer(string from, string to, asset amount, string memo, string sadata)
	{
		//송신자|수신자|액수|메모|{sadata}
	}

	void income()
	{
	}

  private:
	bool iskey(string account)
	{
	}
	bool Check_account(string account)
	{
	}
	bool Check_asset(asset amount)
	{
	}
	bool Check_memo(asset memo)
	{
	}
};

#undef EOSIO_ABI
#define EOSIO_ABI(TYPE, MEMBERS)                                                                                                 \
	extern "C"                                                                                                                   \
	{                                                                                                                            \
		void apply(uint64_t receiver, uint64_t code, uint64_t action)                                                            \
		{                                                                                                                        \
			auto self = receiver;                                                                                                \
			TYPE thiscontract(self);                                                                                             \
			if (action == N(onerror))                                                                                            \
			{                                                                                                                    \
				/* onerror is only valid if it is for the "eosio" code account and authorized by "eosio"'s "active permission */ \
				eosio_assert(code == N(eosio), "onerror action's are only valid from the \"eosio\" system account");             \
			}                                                                                                                    \
			if (code == self)                                                                                                    \
			{                                                                                                                    \
				if (action != N(income))                                                                                         \
				{                                                                                                                \
					switch (action)                                                                                              \
					{                                                                                                            \
						EOSIO_API(TYPE, MEMBERS)                                                                                 \
					}                                                                                                            \
					/* does not allow destructor of thiscontract to run: eosio_exit(0);    */                                    \
				}                                                                                                                \
			}                                                                                                                    \
			else if (code == N(eosio.token) && action == N(transfer))                                                            \
			{                                                                                                                    \
				execute_action(&thiscontract, &token::income);                                                                   \
			}                                                                                                                    \
		}                                                                                                                        \
	}

EOSIO_ABI(token, (setinfo)(create)(mint)(transfer)(income))

// 가시밭길이더라도 자주적 사고를 하는 이의 길을 가십시오. 비판과 논란에 맞서서 당신의 생각을 당당히 밝히십시오. 당신의 마음이 시키는 대로 하십시오. '별난 사람'이라고 낙인찍히는 것보다 순종이라는 오명에 무릎 꿇는 것을 더 두려워하십시오. 당신이 중요하다고 생각하는 이념을 위해서라면 온 힘을 다해 싸우십시오.
// Thomas J. Watson