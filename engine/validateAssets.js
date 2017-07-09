const _ = require('lodash')
const buildings = require('./lib/buildings').default
const techs = require('./lib/technologies').default
const units = require('./lib/units').default

function assert(val, msg) {
  if (!val) {
    throw new Error(msg)
  }
}

/**
 * Validation for values that cannot be checked statically by the compiler.
 * it's run during build after compilation
 */
function validateAssets() {
  const items = _.values(buildings).concat(_.values(units))
  items.forEach(item => {
    _.keys(item.buildingRequirements).forEach(req => assert(
      buildings[req],
      `${item.id} contains invalid building requirement ${req}`,
    ))
    _.keys(item.technologyRequirements).forEach(req => assert(
      techs[req],
      `${item.id} contains invalid technology requirement ${req}`,
    ))
  })
  console.log(`validated ${items.length} assets`)
}

validateAssets()
