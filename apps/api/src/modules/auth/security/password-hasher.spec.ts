import { PasswordHasher } from "./password-hasher";

describe("PasswordHasher", () => {
  const hasher = new PasswordHasher();

  it("gera um hash diferente do texto original", async () => {
    const hash = await hasher.hash("senha-correta-123");
    expect(hash).not.toBe("senha-correta-123");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("confirma como válida a senha correta comparada ao hash", async () => {
    const hash = await hasher.hash("senha-correta-123");
    const result = await hasher.compare("senha-correta-123", hash);
    expect(result).toBe(true);
  });

  it("rejeita uma senha incorreta comparada ao hash", async () => {
    const hash = await hasher.hash("senha-correta-123");
    const result = await hasher.compare("senha-errada", hash);
    expect(result).toBe(false);
  });

  it("gera hashes diferentes para a mesma senha em chamadas distintas (salt aleatório)", async () => {
    const hash1 = await hasher.hash("mesma-senha");
    const hash2 = await hasher.hash("mesma-senha");
    expect(hash1).not.toBe(hash2);
  });
});
