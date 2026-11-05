/* A tiny headless LV2 host for the shootout: one instrument, its state restored from a JSON string under
 * a given key, MIDI notes in, stereo float out. Usage:
 *   host <plugin uri> <state key uri> <state json file> <out.raw> <seconds> <note>:<t>:<vel> ...  */
#include <lilv/lilv.h>
#include <lv2/atom/atom.h>
#include <lv2/atom/util.h>
#include <lv2/midi/midi.h>
#include <lv2/urid/urid.h>
#include <lv2/state/state.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#define SR 48000.0
#define BLOCK 256
static char *uris[512]; static int nuris = 0;
static LV2_URID map(LV2_URID_Map_Handle h, const char *u) { (void)h; for (int i = 0; i < nuris; i++) if (!strcmp(uris[i], u)) return i + 1; uris[nuris] = strdup(u); return ++nuris; }
static const char *unmap(LV2_URID_Unmap_Handle h, LV2_URID id) { (void)h; return id > 0 && (int)id <= nuris ? uris[id - 1] : NULL; }
static char *state_json; static size_t state_len; static LV2_URID state_key, atom_string, atom_chunk;
static LV2_State_Status store(LV2_State_Handle h, uint32_t key, const void *v, size_t size, uint32_t type, uint32_t flags) {
  (void)h; (void)flags; fprintf(stderr, "saved key %s type %s size %zu: %.400s\n", unmap(NULL, key), unmap(NULL, type), size, (const char *)v);
  if (getenv("DUMP")) { FILE *d = fopen(getenv("DUMP"), "wb"); fwrite(v, 1, size, d); fclose(d); }
  return LV2_STATE_SUCCESS; }
static const void *retrieve(LV2_State_Handle h, uint32_t key, size_t *size, uint32_t *type, uint32_t *flags) {
  (void)h; (void)key; *size = state_len + 1; *type = atom_string; *flags = LV2_STATE_IS_POD | LV2_STATE_IS_PORTABLE; return state_json; }
int main(int argc, char **argv) {
  if (argc < 6) { fprintf(stderr, "usage\n"); return 1; }
  FILE *f = fopen(argv[3], "rb"); fseek(f, 0, SEEK_END); state_len = ftell(f); fseek(f, 0, SEEK_SET);
  state_json = calloc(1, state_len + 1); fread(state_json, 1, state_len, f); fclose(f);
  LilvWorld *w = lilv_world_new(); lilv_world_load_all(w);
  LilvNode *uri = lilv_new_uri(w, argv[1]);
  const LilvPlugin *pl = lilv_plugins_get_by_uri(lilv_world_get_all_plugins(w), uri);
  if (!pl) { fprintf(stderr, "no plugin %s\n", argv[1]); return 1; }
  LV2_URID_Map m = { NULL, map }; LV2_URID_Unmap um = { NULL, unmap };
  LV2_Feature fm = { LV2_URID__map, &m }, fu = { LV2_URID__unmap, &um };
  const LV2_Feature *feats[] = { &fm, &fu, NULL };
  state_key = map(NULL, argv[2]); atom_string = map(NULL, LV2_ATOM__String); atom_chunk = map(NULL, LV2_ATOM__Chunk);
  LV2_URID midi_ev = map(NULL, LV2_MIDI__MidiEvent), seq_t = map(NULL, LV2_ATOM__Sequence);
  LilvInstance *in = lilv_plugin_instantiate(pl, SR, feats);
  if (!in) { fprintf(stderr, "instantiate failed\n"); return 1; }
  uint32_t np = lilv_plugin_get_num_ports(pl);
  LilvNode *audio = lilv_new_uri(w, LV2_CORE__AudioPort), *atomp = lilv_new_uri(w, LV2_ATOM__AtomPort), *inp = lilv_new_uri(w, LV2_CORE__InputPort), *ctl = lilv_new_uri(w, LV2_CORE__ControlPort);
  float *bufs[64]; float ctlv[64]; int outs[2] = { -1, -1 }, no = 0; int midi_port = -1, notify_port = -1;
  static uint8_t seqbuf[8192], notbuf[65536];
  for (uint32_t i = 0; i < np; i++) {
    const LilvPort *p = lilv_plugin_get_port_by_index(pl, i);
    if (lilv_port_is_a(pl, p, audio)) { bufs[i] = calloc(BLOCK, sizeof(float)); lilv_instance_connect_port(in, i, bufs[i]); if (no < 2) outs[no++] = i; }
    else if (lilv_port_is_a(pl, p, atomp)) { if (lilv_port_is_a(pl, p, inp)) { midi_port = i; lilv_instance_connect_port(in, i, seqbuf); } else { notify_port = i; lilv_instance_connect_port(in, i, notbuf); } }
    else if (lilv_port_is_a(pl, p, ctl)) { LilvNode *d; lilv_port_get_range(pl, p, &d, NULL, NULL); ctlv[i] = d ? lilv_node_as_float(d) : 0; lilv_instance_connect_port(in, i, &ctlv[i]); }
  }
  lilv_instance_activate(in);
  const LV2_State_Interface *si = lilv_instance_get_extension_data(in, LV2_STATE__interface);
  if (si && state_len > 2) { int r = si->restore(lilv_instance_get_handle(in), retrieve, NULL, 0, feats); fprintf(stderr, "restore %d\n", r); } else fprintf(stderr, "no state interface\n");
  if (si && getenv("SAVE")) si->save(lilv_instance_get_handle(in), store, NULL, 0, feats);
  sleep(3); /* the kick is synthesised on its own thread after a change: give it real time */
  double secs = atof(argv[5]); long total = (long)(secs * SR), done = 0;
  int nn = argc - 6; long nt[64]; int nnote[64], nvel[64];
  for (int k = 0; k < nn; k++) { int n, v; double t; sscanf(argv[6 + k], "%d:%lf:%d", &n, &t, &v); nnote[k] = n; nt[k] = (long)(t * SR); nvel[k] = v; }
  FILE *o = fopen(argv[4], "wb");
  /* a second of nothing first: the plugin may build its kick on another thread after the restore */
  long warm = (long)SR;
  for (long pos = -warm; pos < total; pos += BLOCK) {
    LV2_Atom_Sequence *seq = (LV2_Atom_Sequence *)seqbuf; seq->atom.type = seq_t; seq->atom.size = sizeof(LV2_Atom_Sequence_Body); seq->body.unit = 0; seq->body.pad = 0;
    for (int k = 0; k < nn; k++) {
      for (int on = 0; on < 2; on++) {
        long t = nt[k] + (on ? (long)(0.95 * SR) : 0);
        if (t >= pos && t < pos + BLOCK) {
          struct { LV2_Atom_Event ev; uint8_t msg[4]; } e;
          e.ev.time.frames = t - pos; e.ev.body.type = midi_ev; e.ev.body.size = 3;
          e.msg[0] = on ? 0x80 : 0x90; e.msg[1] = nnote[k]; e.msg[2] = on ? 0 : nvel[k];
          LV2_Atom_Event *dst = lv2_atom_sequence_end(&seq->body, seq->atom.size);
          memcpy(dst, &e, sizeof(LV2_Atom_Event) + 3); seq->atom.size += lv2_atom_pad_size(sizeof(LV2_Atom_Event) + 3);
        }
      }
    }
    LV2_Atom *na = (LV2_Atom *)notbuf; na->type = 0; na->size = sizeof(notbuf) - sizeof(LV2_Atom);
    lilv_instance_run(in, BLOCK);
    if (pos >= 0) for (int i = 0; i < BLOCK && pos + i < total; i++) { float s[2] = { bufs[outs[0]][i], bufs[outs[1]][i] }; fwrite(s, 4, 2, o); }
    done += BLOCK;
  }
  fclose(o); lilv_instance_deactivate(in); lilv_instance_free(in); return 0;
}
