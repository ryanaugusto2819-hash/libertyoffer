// Pure grouping rules for the editor "Meu trabalho" page (unit-tested, no React).
export type WorkItem={id:string;item_number:number;name:string;status:string;due_date:string|null;demand_id:string};

export function isOverdue(item:{due_date:string|null;status:string},today:string):boolean{
 return !!item.due_date&&item.due_date<today&&!['Aprovado','Cancelado'].includes(item.status);
}

export type WorkGroups={overdue:WorkItem[];todo:WorkItem[];waiting:WorkItem[];done:WorkItem[]};

export function myWorkGroups(items:readonly WorkItem[],today:string):WorkGroups{
 const groups:WorkGroups={overdue:[],todo:[],waiting:[],done:[]};
 for(const i of items){
  if(i.status==='Cancelado')continue;
  if(i.status==='Aguardando aprovação')groups.waiting.push(i);
  else if(isOverdue(i,today))groups.overdue.push(i);
  else if(i.status==='Aprovado')groups.done.push(i);
  else groups.todo.push(i);
 }
 return groups;
}
