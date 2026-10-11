import {weights,ages} from './data.js';
// Arithmetic uses unrounded values. Formatting never changes the calculated dose.
export const massUnits={g:1000,mg:1,mcg:0.001};
export const number=value=>value===''||value===null||value===undefined?null:Number.isFinite(Number(value))?Number(value):null;
export const positive=value=>number(value)!==null&&number(value)>0;
export const kgFrom=(value,unit='kg')=>positive(value)&&['kg','lb'].includes(unit)?Number(value)*(unit==='lb'?0.45359237:1):null;
export const poundsFrom=value=>positive(value)?Number(value)/0.45359237:null;
export const fmt=value=>Number.isFinite(value)?Number(value.toPrecision(7)).toLocaleString('en-US',{maximumFractionDigits:6,useGrouping:false}):'—';
export function volumeFor(dose,unit,concentration,concentrationUnit='mg'){
  if(!positive(concentration)||!Number.isFinite(dose)||dose<0)return null;
  if(unit==='mL')return dose;
  if(unit==='mEq'&&concentrationUnit==='mEq'){const result=dose/Number(concentration);return Number.isFinite(result)?result:null;}
  if(!(unit in massUnits)||!(concentrationUnit in massUnits))return null;
  const result=dose*massUnits[unit]/(Number(concentration)*massUnits[concentrationUnit]);return Number.isFinite(result)?result:null;
}
export function calculateDose(recipe,inputs={}){
  const age=number(inputs.age),weight=recipe.ideal?number(inputs.idealKg):number(inputs.weightKg);
  if(recipe.blocked)return {error:recipe.blocked};
  if(recipe.ageMin!==undefined||recipe.ageMax!==undefined){
    if(age===null||age<0){
      return {error:'Enter patient age in years into the calculator up top to confirm this dose applies to your patient.'};
    }
    if(age<(recipe.ageMin??0)||age>=(recipe.ageMax??Infinity))return {error:'This dose does not apply to the entered age. Choose the matching adult / pediatric indication.'};
  }
  if(recipe.table&&age!==null&&age>=0&&age<16){
    const selected=number(inputs.tableIndex),index=selected===null?weights.indexOf(Number(inputs.weightKg)):selected;
    const t=recipe.table;
    if(!Number.isInteger(index)||index<0||index>=weights.length||t.doses[index]===null)return {error:'N/A',table:true};
    if(recipe.requiredConcentration&&Number(inputs.concentration)!==recipe.requiredConcentration)return {error:`This pathway requires ${recipe.requiredConcentration} mg/mL stock. Confirm the label.`,table:true};
    const dose=t.doses[index],unit=t.doseUnits?.[index]??t.unit;
    let remaining=null;
    if(recipe.totalMax!==undefined){
      const prior=number(inputs.prior);
      if(prior===null||prior<0)return {error:`Enter amount already given in ${unit} (0 if none).`,table:true};
      remaining=recipe.totalMax-prior;
      if(remaining<=0)return {error:'Protocol cumulative maximum reached.',table:true};
      if(remaining<dose)return {error:'Remaining allowance is below this dose. Contact medical control.',table:true};
    }
    const matched=Number(inputs.concentration)===t.concentrationValue;
    const volume=unit==='mL'?dose:!positive(inputs.concentration)?null:matched&&t.volumes?t.volumes[index]:volumeFor(dose,unit,inputs.concentration,inputs.concentrationUnit);
    return {low:dose,high:dose,unit,volumeLow:volume,volumeHigh:volume,remaining,limited:false,table:true,tableWeight:weights[index],tableAge:ages[index],printedVolume:unit==='mL'||matched&&!!t.volumes};
  }
  if((recipe.kind==='weight'||recipe.kind==='band'&&recipe.rule!=='glucagon-age')&&!positive(weight))return {error:recipe.ideal?'Enter ideal body weight (kg).':'Enter patient weight.'};
  if(recipe.weightMin!==undefined||recipe.weightMax!==undefined||recipe.weightMinExclusive!==undefined){
    const actual=number(inputs.weightKg);if(!positive(actual))return {error:'Enter patient weight.'};
    if(actual<(recipe.weightMin??0)||actual>=(recipe.weightMax??Infinity)||actual<=(recipe.weightMinExclusive??-Infinity))return {error:'Weight is outside this dose band. Review the pathway.'};
  }
  let low=recipe.low,high=recipe.high??recipe.low;
  if(recipe.kind==='weight'){low*=weight;high*=weight;}
  if(recipe.kind==='band'){
    if(recipe.rule==='seizure-im')low=high=weight<13?Math.min(weight*.2,2.4):weight<=40?5:10;
    else if(recipe.rule==='seizure-iv'){low=weight<=40?Math.min(weight*.1,5):2;high=weight<=40?low:5;}
    else if(recipe.rule==='anaphylaxis-im')low=high=weight<15?.15:weight<=30?.3:.5;
    else if(recipe.rule==='glucagon-age'){if(age===null)return {error:'Enter patient age in years above to calculate the age-based dose.'};low=high=age<6?.5:1;}
    else return {error:'Review source dosing.'};
  }
  if(!Number.isFinite(low)||!Number.isFinite(high)||low<=0||high<low)return {error:'Review dose inputs.'};
  const raw=[low,high];
  if(recipe.min!==undefined){low=Math.max(low,recipe.min);high=Math.max(high,recipe.min);}
  if(recipe.max!==undefined){low=Math.min(low,recipe.max);high=Math.min(high,recipe.max);}
  let remaining=null;
  if(recipe.totalMax!==undefined||recipe.totalPerKg!==undefined){
    if(recipe.totalPerKg&&!positive(weight))return {error:'Enter patient weight.'};
    const prior=number(inputs.prior);
    if(prior===null||prior<0)return {error:`Enter amount already given in ${recipe.unit} (0 if none).`};
    remaining=(recipe.totalMax??recipe.totalPerKg*weight)-prior;
    if(remaining<=0)return {error:'Protocol cumulative maximum reached.'};
    // A remaining allowance is not authorization to give less than the protocol's minimum dose.
    if(remaining<low)return {error:'Remaining allowance is below this dose. Contact medical control.'};
    high=Math.min(high,remaining);
  }
  if(recipe.requiredConcentration&&Number(inputs.concentration)!==recipe.requiredConcentration)return {error:`This pathway requires ${recipe.requiredConcentration} mg/mL stock. Confirm the label.`};
  const volumeLow=recipe.unit==='mL'?low:volumeFor(low,recipe.unit,inputs.concentration,inputs.concentrationUnit);
  const volumeHigh=recipe.unit==='mL'?high:volumeFor(high,recipe.unit,inputs.concentration,inputs.concentrationUnit);
  return {low,high,unit:recipe.unit,volumeLow,volumeHigh,remaining,limited:low!==raw[0]||high!==raw[1],weight:recipe.kind==='weight'||recipe.kind==='band'?weight:null,ideal:!!recipe.ideal};
}
export function orderedDose({dose,doseUnit,perKg,weightKg,max,stockAmount,stockUnit,stockVolume}){
  if(!positive(dose)||!positive(stockAmount)||!positive(stockVolume)||perKg&&!positive(weightKg))return null;
  if(!(doseUnit in massUnits)&&doseUnit!=='mEq')return null;
  const limit=number(max);if(limit!==null&&limit<=0)return null;
  const requested=Number(dose)*(perKg?Number(weightKg):1),amount=limit===null?requested:Math.min(requested,limit);
  const volume=volumeFor(amount,doseUnit,Number(stockAmount)/Number(stockVolume),stockUnit);
  return volume===null?null:{amount,volume,limited:amount!==requested};
}
export function dripRate(volume,minutes,factor){
  if(!positive(volume)||!positive(minutes)||![10,15,20,60].includes(Number(factor)))return null;
  const hourly=Number(volume)/Number(minutes)*60,drops=Number(volume)/Number(minutes)*Number(factor);
  return Number.isFinite(hourly)&&Number.isFinite(drops)?{hourly,drops,roundedDrops:Math.round(drops)}:null;
}
export function infusionRate({dose,rateUnit,weightKg,stockAmount,stockUnit,bagVolume,factor}){
  if(!positive(dose)||!positive(stockAmount)||!positive(bagVolume)||!(stockUnit in massUnits))return null;
  const units={'mcg/kg/min':['mcg',60,true],'mcg/min':['mcg',60,false],'mg/min':['mg',60,false],'mg/hr':['mg',1,false],'mcg/kg/hr':['mcg',1,true]};
  const selected=units[rateUnit];if(!selected||selected[2]&&!positive(weightKg))return null;
  const massPerHour=Number(dose)*massUnits[selected[0]]*selected[1]*(selected[2]?Number(weightKg):1);
  const hourly=massPerHour/(Number(stockAmount)*massUnits[stockUnit]/Number(bagVolume));
  return Number.isFinite(hourly)?{hourly,drops:[10,15,20,60].includes(Number(factor))?hourly/60*Number(factor):null}:null;
}
export function dilute({stockAmount,stockUnit,stockVolume,targetConcentration,targetUnit,finalVolume}){
  if(![stockAmount,stockVolume,targetConcentration,finalVolume].every(positive)||!(stockUnit in massUnits)||!(targetUnit in massUnits))return null;
  const stockMgPerMl=Number(stockAmount)*massUnits[stockUnit]/Number(stockVolume),targetMgPerMl=Number(targetConcentration)*massUnits[targetUnit];
  if(targetMgPerMl>=stockMgPerMl)return null;
  const draw=targetMgPerMl*Number(finalVolume)/stockMgPerMl;
  return Number.isFinite(draw)&&draw>0&&draw<Number(finalVolume)?{draw,diluent:Number(finalVolume)-draw,finalVolume:Number(finalVolume)}:null;
}
