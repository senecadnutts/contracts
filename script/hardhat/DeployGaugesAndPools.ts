import { getContractAt } from "./utils/helpers";
import { PoolFactory, Voter } from "../../artifacts/types";
import jsonConstants from "../constants/Base.json";
import deployedContracts from "../constants/output/ProtocolOutput.json";

async function main() {
  const factory = await getContractAt<PoolFactory>(
    "PoolFactory",
    deployedContracts.PoolFactory
  );
  const voter = await getContractAt<Voter>("Voter", deployedContracts.Voter);

  // Deploy non-AERO pools and gauges
  for (var i = 0; i < jsonConstants.pools.length; i++) {
    const { stable, tokenA, tokenB } = jsonConstants.pools[i];
    await factory.functions["createPool(address,address,bool)"](
      tokenA,
      tokenB,
      stable,
      { gasLimit: 5000000 }
    );
    let pool = await factory.functions["getPool(address,address,bool)"](
      tokenA,
      tokenB,
      stable,
      {
        gasLimit: 5000000,
      }
    );
    await voter.createGauge(
      deployedContracts.PoolFactory, // PoolFactory
      pool[0],
      { gasLimit: 5000000 }
    );
  }

  // Deploy AERO pools and gauges
  for (var i = 0; i < jsonConstants.poolsAero.length; i++) {
    const [stable, token] = Object.values(jsonConstants.poolsAero[i]);
    await factory.functions["createPool(address,address,bool)"](
      deployedContracts.AERO,
      token as string,
      stable as boolean,
      {
        gasLimit: 5000000,
      }
    );
    let pool = await factory.functions["getPool(address,address,bool)"](
      deployedContracts.AERO,
      token as string,
      stable as boolean,
      {
        gasLimit: 5000000,
      }
    );
    await voter.createGauge(
      deployedContracts.PoolFactory, // PoolFactory
      pool[0],
      { gasLimit: 5000000 }
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
