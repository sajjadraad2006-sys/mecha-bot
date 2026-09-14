import { AcademicTopic, TopicPrerequisite, AcademicFactStatus } from './topic.js';
import { EvidenceScope } from './evidence.js';

export class PrerequisiteGraph {
  private topics: Map<string, AcademicTopic>;
  // topicKey -> list of direct prerequisite topicKeys that this topic depends on
  private adjacencyList: Map<string, Set<string>>;
  private edgeMetadata: Map<string, TopicPrerequisite>;

  constructor() {
    this.topics = new Map();
    this.adjacencyList = new Map();
    this.edgeMetadata = new Map();
  }

  /**
   * Registers a topic into the graph.
   */
  addTopic(topic: AcademicTopic): void {
    this.topics.set(topic.topicKey, topic);
    if (!this.adjacencyList.has(topic.topicKey)) {
      this.adjacencyList.set(topic.topicKey, new Set());
    }
  }

  /**
   * Registers a directed prerequisite dependency:
   * topicKey depends on prerequisiteTopicKey.
   */
  addPrerequisite(
    topicKey: string,
    prerequisiteTopicKey: string,
    status: AcademicFactStatus = 'CONFIRMED',
    evidenceScope: EvidenceScope = EvidenceScope.EXACT_COURSE,
    notes?: string | undefined,
  ): void {
    if (!this.adjacencyList.has(topicKey)) {
      this.adjacencyList.set(topicKey, new Set());
    }
    this.adjacencyList.get(topicKey)!.add(prerequisiteTopicKey);

    const edgeKey = `${topicKey}->${prerequisiteTopicKey}`;
    this.edgeMetadata.set(edgeKey, {
      topicKey,
      prerequisiteTopicKey,
      status,
      evidenceScope,
      notes,
    });
  }

  /**
   * Returns direct prerequisite topics for a given topicKey.
   */
  getDirectPrerequisites(topicKey: string): AcademicTopic[] {
    const prereqKeys = this.adjacencyList.get(topicKey);
    if (!prereqKeys) return [];

    const result: AcademicTopic[] = [];
    for (const key of prereqKeys) {
      const topic = this.topics.get(key);
      if (topic) {
        result.push(topic);
      }
    }
    return result;
  }

  /**
   * Returns the full transitive dependency chain for a topic,
   * ordered from foundational prerequisite to immediate prerequisite.
   * Cycle-safe: ignores back-edges if a cycle exists.
   */
  getDependencyChain(topicKey: string): AcademicTopic[] {
    const visited = new Set<string>();
    const chain: AcademicTopic[] = [];

    const traverse = (currentKey: string, path: Set<string>) => {
      const prereqs = this.adjacencyList.get(currentKey);
      if (!prereqs) return;

      for (const nextKey of prereqs) {
        if (path.has(nextKey)) {
          // Cycle detected in current path, skip to avoid infinite loop
          continue;
        }
        if (!visited.has(nextKey)) {
          visited.add(nextKey);
          path.add(nextKey);
          traverse(nextKey, path);
          path.delete(nextKey);

          const topic = this.topics.get(nextKey);
          if (topic) {
            chain.push(topic);
          }
        }
      }
    };

    traverse(topicKey, new Set([topicKey]));
    return chain;
  }

  /**
   * Detects cycles in the prerequisite graph using depth-first search.
   * Returns an array of cycle paths (e.g. [['A', 'B', 'A']]), or empty array if DAG.
   */
  detectCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const path: string[] = [];

    const dfs = (node: string) => {
      visited.add(node);
      recStack.add(node);
      path.push(node);

      const neighbors = this.adjacencyList.get(node);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            dfs(neighbor);
          } else if (recStack.has(neighbor)) {
            // Cycle found: extract subpath from neighbor to end, plus neighbor
            const cycleStartIndex = path.indexOf(neighbor);
            const cyclePath = path.slice(cycleStartIndex).concat(neighbor);
            cycles.push(cyclePath);
          }
        }
      }

      recStack.delete(node);
      path.pop();
    };

    for (const node of this.adjacencyList.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return cycles;
  }
}
