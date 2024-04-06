
import Graph from '~/utils/graph';
let graph = new Graph([]);

export const useGraph = (command: string, data: Planet[] | string[]) => {
  if (command === 'recreate') {
    const map = data.reduce((total: { [from: string]: { [to: string]: number } }, item: any) => {
      total[item.name] = item.routes.reduce((total: {[id: string]: number}, route: any) => {
        total[route.to] = route.cost;
        return total;
      }, {});
      return total;
    }, {});

    graph = new Graph(map);
  }
  if (command === 'route') {
    return (graph.findShortestPath(data[0], data[1]) || []).slice(1);
  }
  return ref()
}
