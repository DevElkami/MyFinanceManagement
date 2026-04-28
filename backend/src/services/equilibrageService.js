exports.compute = (acc1, acc2, operations, categories, overrides) => {
  const salaireCategory = categories.find(c => c.type === 'Salaire');

  const months = [...new Set(operations.map(o => o.date.slice(0, 7)))].sort();
  const result = {};

  for (const month of months) {
    const ops1 = operations.filter(o => o.accountId === acc1.id && o.date.startsWith(month) && o.equilibre);
    const ops2 = operations.filter(o => o.accountId === acc2.id && o.date.startsWith(month) && o.equilibre);

    const sal1 = salaireCategory
      ? ops1.filter(o => o.categoryId === salaireCategory.id && parseFloat(o.amount) > 0).reduce((s, o) => s + parseFloat(o.amount), 0)
      : 0;
    const sal2 = salaireCategory
      ? ops2.filter(o => o.categoryId === salaireCategory.id && parseFloat(o.amount) > 0).reduce((s, o) => s + parseFloat(o.amount), 0)
      : 0;

    const deb1 = ops1.filter(o => parseFloat(o.amount) < 0).reduce((s, o) => s + parseFloat(o.amount), 0);
    const deb2 = ops2.filter(o => parseFloat(o.amount) < 0).reduce((s, o) => s + parseFloat(o.amount), 0);
    const totalDeb = deb1 + deb2;

    const hasSalaries = sal1 > 0 && sal2 > 0;
    let ratio1 = 0, ratio2 = 0, prorata1 = 0, prorata2 = 0, ecart1 = 0, ecart2 = 0;

    if (hasSalaries) {
      ratio1 = (sal1 + sal2) / sal1;
      ratio2 = (sal1 + sal2) / sal2;
      prorata1 = totalDeb / ratio2;
      prorata2 = totalDeb / ratio1;

      const prevMonth = getPrevMonth(month);
      const prevResult = result[prevMonth];
      const report1 = prevResult ? prevResult.ecart1 : 0;
      const report2 = prevResult ? prevResult.ecart2 : 0;

      const override = overrides.find(o =>
        ((o.account1Id === acc1.id && o.account2Id === acc2.id) ||
         (o.account1Id === acc2.id && o.account2Id === acc1.id)) &&
        o.month === month
      );

      if (override) {
        ecart1 = parseFloat(override.ecartAccount1 || 0);
        ecart2 = parseFloat(override.ecartAccount2 || 0);
      } else {
        ecart1 = deb1 - prorata1 + report1;
        ecart2 = deb2 - prorata2 + report2;
      }
    }

    // Category breakdown
    const catBreakdown = {};
    for (const op of [...ops1, ...ops2]) {
      if (parseFloat(op.amount) >= 0) continue;
      const cat = categories.find(c => c.id === op.categoryId);
      const key = cat ? cat.label : 'Non catégorisé';
      if (!catBreakdown[key]) catBreakdown[key] = { acc1Total: 0, acc2Total: 0, ops1: [], ops2: [] };
      if (op.accountId === acc1.id) {
        catBreakdown[key].acc1Total += parseFloat(op.amount);
        catBreakdown[key].ops1.push(op);
      } else {
        catBreakdown[key].acc2Total += parseFloat(op.amount);
        catBreakdown[key].ops2.push(op);
      }
    }

    result[month] = {
      month, sal1, sal2, deb1, deb2, totalDeb,
      hasSalaries, ratio1, ratio2, prorata1, prorata2, ecart1, ecart2,
      categories: catBreakdown,
    };
  }

  return result;
};

function getPrevMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1, 0);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
